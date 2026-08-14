import { PrismaClient, Role, type SourceType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { RAW_DEALS } from "./seed-data";
import { DEFAULT_PASS_REASON_TAGS } from "../lib/taxonomy";
import { STAGE_MAP, STATUS_MAP, TYPE_MAP, mapSourceType } from "../lib/import-mappings";

const prisma = new PrismaClient();

function sourceType(raw: string | null): SourceType {
  return mapSourceType(raw);
}

// Lightweight keyword -> pass-reason-tag mapping so the seeded "Dead" deals
// arrive with realistic analytics tags. The in-app UI lets users manage tags
// on every deal going forward.
const TAG_KEYWORDS: [RegExp, string][] = [
  [/valuation|counter offer|price/i, "Valuation Gap"],
  [/competit/i, "Competitive Landscape"],
  [/regulat/i, "Regulatory Risk"],
  [/season/i, "Seasonality / Cyclicality"],
  [/real estate|lease/i, "Real Estate / Lease Risk"],
  [/concentration/i, "Customer Concentration"],
  [/management|tenure/i, "Management Team"],
  [/cash burn|financial|fcf|margin|revenue depends|budget/i, "Financial Performance"],
  [/structure|debt facility/i, "Deal Structure"],
  [/biological|mortality|risk inherent/i, "Other"],
];

function tagsForReason(reason: string | null): string[] {
  if (!reason) return [];
  const found = new Set<string>();
  for (const [pattern, tag] of TAG_KEYWORDS) {
    if (pattern.test(reason)) found.add(tag);
  }
  if (found.size === 0) found.add("Other");
  return [...found];
}

async function main() {
  console.log("Seeding pass reason tags...");
  for (const label of DEFAULT_PASS_REASON_TAGS) {
    await prisma.passReasonTag.upsert({
      where: { label },
      create: { label },
      update: {},
    });
  }

  console.log("Seeding users...");
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@godwincap.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: "Admin",
      initials: "ADM",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: Role.ADMIN,
    },
    update: {},
  });

  const teamInitials = [...new Set(
    RAW_DEALS.flatMap((d) => [d.primaryOwnerInitials, d.secondaryOwnerInitials]).filter(
      (v): v is string => !!v
    )
  )];

  const defaultTeamPassword = "Welcome123!";
  const users: Record<string, { id: string }> = {};
  for (const initials of teamInitials) {
    const email = `${initials.toLowerCase()}@godwincap.com`;
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        name: initials,
        initials,
        email,
        passwordHash: await bcrypt.hash(defaultTeamPassword, 10),
        role: Role.MEMBER,
      },
      update: {},
    });
    users[initials] = user;
  }
  console.log(
    `Seeded ${teamInitials.length} team member accounts with default password "${defaultTeamPassword}" (rename/reset in Settings).`
  );

  console.log("Seeding sources & contacts...");
  const sourceCache = new Map<string, string>(); // key: name|type -> id
  const contactCache = new Map<string, string>(); // key: name|sourceId -> id

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
    const contact =
      existing ??
      (await prisma.contact.create({
        data: { name, sourceId: sourceId ?? undefined },
      }));
    contactCache.set(key, contact.id);
    return contact.id;
  }

  console.log("Seeding deals...");
  for (const raw of RAW_DEALS) {
    const type = sourceType(raw.referralType);
    const sourceId = await getSource(raw.sourceName, type);
    const contactId = await getContact(raw.primaryContactName, sourceId);
    const tags = tagsForReason(raw.reasonForPass);

    const stage = STAGE_MAP[raw.stage] ?? "INTRO_TEASER";
    const status = STATUS_MAP[raw.status] ?? "ACTIVE";

    const deal = await prisma.deal.create({
      data: {
        projectName: raw.projectName,
        companyName: raw.companyName,
        hq: raw.hq,
        description: raw.description,
        website: raw.website,
        stage,
        status,
        sourceId: sourceId ?? undefined,
        referralType: raw.referralType ? type : undefined,
        primaryContactId: contactId ?? undefined,
        type: raw.type ? TYPE_MAP[raw.type] : undefined,
        dateReceived: new Date(raw.dateReceived),
        primaryIndustry: raw.primaryIndustry,
        secondaryIndustry: raw.secondaryIndustry,
        enterpriseValue: raw.enterpriseValue ?? undefined,
        revenue: raw.revenue ?? undefined,
        ebitda: raw.ebitda ?? undefined,
        nextStep: raw.nextStep,
        primaryOwnerId: raw.primaryOwnerInitials ? users[raw.primaryOwnerInitials]?.id : undefined,
        secondaryOwnerId: raw.secondaryOwnerInitials
          ? users[raw.secondaryOwnerInitials]?.id
          : undefined,
        reasonForPass: raw.reasonForPass,
        closedAt: stage === "CLOSED" ? new Date(raw.dateReceived) : undefined,
        activities: {
          create: {
            type: "SYSTEM",
            content: "Deal added to the pipeline.",
            createdAt: new Date(raw.dateReceived),
          },
        },
      },
    });

    if (tags.length) {
      const tagRecords = await prisma.passReasonTag.findMany({ where: { label: { in: tags } } });
      await prisma.dealPassReasonTag.createMany({
        data: tagRecords.map((t) => ({ dealId: deal.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    if (raw.nextStep) {
      await prisma.task.create({
        data: {
          dealId: deal.id,
          title: raw.nextStep,
          assigneeId: raw.primaryOwnerInitials ? users[raw.primaryOwnerInitials]?.id : undefined,
        },
      });
    }
  }

  console.log(`Seeded ${RAW_DEALS.length} deals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
