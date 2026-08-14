import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { buildDealWhere } from "@/lib/deal-filters";
import { STAGE_LABELS, STATUS_LABELS, TYPE_LABELS, SOURCE_TYPE_LABELS } from "@/lib/taxonomy";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const where = buildDealWhere(params);

  const deals = await prisma.deal.findMany({
    where,
    include: { source: true, primaryContact: true, primaryOwner: true, secondaryOwner: true },
    orderBy: { dateReceived: "desc" },
  });

  const rows = deals.map((d) => ({
    "Project Name": d.projectName ?? "",
    "Company Name": d.companyName ?? "",
    HQ: d.hq ?? "",
    Website: d.website ?? "",
    Stage: STAGE_LABELS[d.stage],
    Status: STATUS_LABELS[d.status],
    "Source / Referral": d.source?.name ?? "",
    "Referral Type": d.referralType ? SOURCE_TYPE_LABELS[d.referralType] : "",
    "Primary Contact": d.primaryContact?.name ?? "",
    Type: d.type ? TYPE_LABELS[d.type] : "",
    "Date Received": d.dateReceived.toISOString().slice(0, 10),
    "Primary Industry": d.primaryIndustry ?? "",
    "Secondary Industry": d.secondaryIndustry ?? "",
    "Enterprise Value ($mm)": d.enterpriseValue ?? "",
    "Revenue ($mm)": d.revenue ?? "",
    "EBITDA ($mm)": d.ebitda ?? "",
    "Next Step": d.nextStep ?? "",
    "Primary Owner": d.primaryOwner?.initials ?? "",
    "Secondary Owner": d.secondaryOwner?.initials ?? "",
    "Reason for Pass": d.reasonForPass ?? "",
  }));

  const csv = Papa.unparse(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="deals-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
