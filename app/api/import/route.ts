import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { STAGE_MAP, STATUS_MAP, TYPE_MAP, mapSourceType, IMPORT_HEADERS } from "@/lib/import-mappings";
import type { SourceType } from "@prisma/client";

type Cell = string | number | boolean | Date | null | undefined;

function clean(v: Cell): string | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString();
  const s = String(v).trim();
  if (!s || s === "-") return null;
  return s;
}

function cleanNumber(v: Cell): number | null {
  const s = clean(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function findHeaderRow(rows: Cell[][]): { rowIndex: number; colIndex: Record<string, number> } | null {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const colIndex: Record<string, number> = {};
    for (const header of IMPORT_HEADERS) {
      const idx = row.findIndex((c) => typeof c === "string" && c.trim() === header);
      if (idx >= 0) colIndex[header] = idx;
    }
    // Require the two most load-bearing columns to be present to accept this row.
    if (colIndex["Company Name"] !== undefined && colIndex["Stage"] !== undefined) {
      return { rowIndex: i, colIndex };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can import data." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.redirect(new URL("/settings/import?error=No file uploaded", req.url));
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

  let header: { rowIndex: number; colIndex: Record<string, number> } | null = null;
  let rows: Cell[][] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheetRows = XLSX.utils.sheet_to_json<Cell[]>(workbook.Sheets[sheetName], {
      header: 1,
      defval: null,
    });
    const found = findHeaderRow(sheetRows);
    if (found) {
      header = found;
      rows = sheetRows;
      break;
    }
  }

  if (!header) {
    return NextResponse.redirect(
      new URL("/settings/import?error=Could not find a deal table in that file", req.url)
    );
  }

  const { colIndex } = header;
  const get = (row: Cell[], key: (typeof IMPORT_HEADERS)[number]) =>
    colIndex[key] !== undefined ? row[colIndex[key]] : null;

  const sourceCache = new Map<string, string>();
  const contactCache = new Map<string, string>();

  async function getSource(name: string | null, type: SourceType) {
    if (!name) return null;
    const key = `${name}|${type}`;
    if (sourceCache.has(key)) return sourceCache.get(key)!;
    const source = await prisma.source.upsert({
      where: { name_type: { name, type } },
      create: { name, type },
      update: {},
    });
    sourceCache.set(key, source.id);
    return source.id;
  }

  async function getContact(name: string | null, sourceId: string | null) {
    if (!name) return null;
    const key = `${name}|${sourceId ?? ""}`;
    if (contactCache.has(key)) return contactCache.get(key)!;
    const existing = await prisma.contact.findFirst({ where: { name, sourceId: sourceId ?? undefined } });
    const contact = existing ?? (await prisma.contact.create({ data: { name, sourceId: sourceId ?? undefined } }));
    contactCache.set(key, contact.id);
    return contact.id;
  }

  const owners = await prisma.user.findMany();
  const ownerByInitials = new Map(owners.map((o) => [o.initials.toUpperCase(), o.id]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = header.rowIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    if (row.every((c) => c === null || c === undefined || String(c).trim() === "")) continue;

    const projectName = clean(get(row, "Project Name"));
    const companyName = clean(get(row, "Company Name"));
    const stageRaw = clean(get(row, "Stage"));

    if (stageRaw === "x" || (!projectName && !companyName)) {
      skipped++;
      continue;
    }

    const referralTypeRaw = clean(get(row, "Referral Type"));
    const sourceTypeEnum = mapSourceType(referralTypeRaw);
    const sourceName = clean(get(row, "Source / Referral"));
    const sourceId = await getSource(sourceName, sourceTypeEnum);
    const contactId = await getContact(clean(get(row, "Primary Contact")), sourceId);

    const primaryOwnerInitials = clean(get(row, "Primary Owner"))?.toUpperCase();
    const secondaryOwnerInitials = clean(get(row, "Secondary Owner"))?.toUpperCase();

    const dateReceivedRaw = get(row, "Date Received");
    const dateReceived =
      dateReceivedRaw instanceof Date
        ? dateReceivedRaw
        : clean(dateReceivedRaw)
          ? new Date(clean(dateReceivedRaw)!)
          : new Date();

    const data = {
      projectName,
      companyName,
      hq: clean(get(row, "HQ")),
      description: clean(get(row, "Description")),
      website: clean(get(row, "Website")),
      stage: (stageRaw && STAGE_MAP[stageRaw]) || "INTRO_TEASER",
      status: (clean(get(row, "Status")) && STATUS_MAP[clean(get(row, "Status"))!]) || "ACTIVE",
      sourceId: sourceId ?? undefined,
      referralType: sourceName ? sourceTypeEnum : undefined,
      primaryContactId: contactId ?? undefined,
      type: (() => {
        const t = clean(get(row, "Type"));
        return t ? TYPE_MAP[t] : undefined;
      })(),
      dateReceived,
      primaryIndustry: clean(get(row, "Primary Industry")),
      secondaryIndustry: clean(get(row, "Secondary Industry")),
      enterpriseValue: cleanNumber(get(row, "Enterprise Value")),
      revenue: cleanNumber(get(row, "Revenue")),
      ebitda: cleanNumber(get(row, "EBITDA")),
      nextStep: clean(get(row, "Next Step")),
      primaryOwnerId: primaryOwnerInitials ? ownerByInitials.get(primaryOwnerInitials) : undefined,
      secondaryOwnerId: secondaryOwnerInitials ? ownerByInitials.get(secondaryOwnerInitials) : undefined,
      reasonForPass: clean(get(row, "Reason for Pass")),
    };

    const existing = await prisma.deal.findFirst({
      where: companyName
        ? { companyName, projectName: projectName ?? undefined }
        : { projectName: projectName ?? undefined, companyName: null },
    });

    if (existing) {
      await prisma.deal.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.deal.create({
        data: { ...data, activities: { create: { type: "SYSTEM", content: "Imported from Excel." } } },
      });
      created++;
    }
  }

  return NextResponse.redirect(
    new URL(`/settings/import?created=${created}&updated=${updated}&skipped=${skipped}`, req.url)
  );
}
