"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { DealStage, DealStatus, DealType, SourceType, ActivityType } from "@prisma/client";

const STAGE_VALUES: DealStage[] = [
  "INTRO_TEASER",
  "NDA_INITIAL_REVIEW",
  "IOI_SUBMITTED",
  "MANAGEMENT_MEETING",
  "LOI_TERM_SHEET",
  "CONFIRMATORY_DILIGENCE",
  "CLOSED",
];
const STATUS_VALUES: DealStatus[] = ["ACTIVE", "ON_HOLD", "DEAD", "EXECUTED"];
const TYPE_VALUES: DealType[] = ["EQUITY_CO_INVEST", "MINORITY_EQUITY", "CONTROL_BUYOUT", "DEBT"];
const SOURCE_TYPE_VALUES: SourceType[] = [
  "SPONSOR",
  "INVESTMENT_BANK",
  "FIRM_CONNECTION",
  "PROPRIETARY",
  "OTHER",
];

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function enumOrNull<T extends string>(value: string | null, allowed: T[]): T | null {
  return value && (allowed as string[]).includes(value) ? (value as T) : null;
}

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function resolveSourceAndContact(formData: FormData) {
  const sourceName = str(formData, "sourceName");
  const sourceTypeRaw = enumOrNull(str(formData, "sourceType"), SOURCE_TYPE_VALUES) ?? "OTHER";
  const contactName = str(formData, "contactName");
  const contactEmail = str(formData, "contactEmail");
  const contactPhone = str(formData, "contactPhone");

  let sourceId: string | undefined;
  if (sourceName) {
    const source = await prisma.source.upsert({
      where: { name_type: { name: sourceName, type: sourceTypeRaw } },
      create: { name: sourceName, type: sourceTypeRaw },
      update: {},
    });
    sourceId = source.id;
  }

  let contactId: string | undefined;
  if (contactName) {
    const existing = await prisma.contact.findFirst({
      where: { name: contactName, sourceId: sourceId ?? null },
    });
    const contact =
      existing ??
      (await prisma.contact.create({
        data: { name: contactName, sourceId, email: contactEmail, phone: contactPhone },
      }));
    if (existing && (contactEmail || contactPhone)) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          email: contactEmail ?? existing.email,
          phone: contactPhone ?? existing.phone,
        },
      });
    }
    contactId = contact.id;
  }

  return { sourceId, contactId, sourceType: sourceName ? sourceTypeRaw : null };
}

export async function createDealAction(formData: FormData) {
  const { sourceId, contactId, sourceType } = await resolveSourceAndContact(formData);

  const deal = await prisma.deal.create({
    data: {
      projectName: str(formData, "projectName"),
      companyName: str(formData, "companyName"),
      hq: str(formData, "hq"),
      website: str(formData, "website"),
      description: str(formData, "description"),
      stage: enumOrNull(str(formData, "stage"), STAGE_VALUES) ?? "INTRO_TEASER",
      status: enumOrNull(str(formData, "status"), STATUS_VALUES) ?? "ACTIVE",
      type: enumOrNull(str(formData, "type"), TYPE_VALUES),
      sourceId,
      referralType: sourceType,
      primaryContactId: contactId,
      dateReceived: str(formData, "dateReceived")
        ? new Date(str(formData, "dateReceived")!)
        : new Date(),
      primaryIndustry: str(formData, "primaryIndustry"),
      secondaryIndustry: str(formData, "secondaryIndustry"),
      enterpriseValue: num(formData, "enterpriseValue"),
      revenue: num(formData, "revenue"),
      ebitda: num(formData, "ebitda"),
      nextStep: str(formData, "nextStep"),
      primaryOwnerId: str(formData, "primaryOwnerId"),
      secondaryOwnerId: str(formData, "secondaryOwnerId"),
      reasonForPass: str(formData, "reasonForPass"),
      activities: {
        create: {
          type: "SYSTEM",
          content: "Deal added to the pipeline.",
          authorId: await currentUserId(),
        },
      },
    },
  });

  revalidatePath("/deals");
  revalidatePath("/pipeline");
  revalidatePath("/");
  redirect(`/deals/${deal.id}`);
}

export async function updateDealAction(dealId: string, formData: FormData) {
  const before = await prisma.deal.findUniqueOrThrow({ where: { id: dealId } });
  const { sourceId, contactId, sourceType } = await resolveSourceAndContact(formData);

  const newStage = enumOrNull(str(formData, "stage"), STAGE_VALUES) ?? before.stage;
  const newStatus = enumOrNull(str(formData, "status"), STATUS_VALUES) ?? before.status;

  await prisma.deal.update({
    where: { id: dealId },
    data: {
      projectName: str(formData, "projectName"),
      companyName: str(formData, "companyName"),
      hq: str(formData, "hq"),
      website: str(formData, "website"),
      description: str(formData, "description"),
      stage: newStage,
      status: newStatus,
      type: enumOrNull(str(formData, "type"), TYPE_VALUES),
      sourceId: sourceId ?? null,
      referralType: sourceType,
      primaryContactId: contactId ?? null,
      dateReceived: str(formData, "dateReceived")
        ? new Date(str(formData, "dateReceived")!)
        : before.dateReceived,
      primaryIndustry: str(formData, "primaryIndustry"),
      secondaryIndustry: str(formData, "secondaryIndustry"),
      enterpriseValue: num(formData, "enterpriseValue"),
      revenue: num(formData, "revenue"),
      ebitda: num(formData, "ebitda"),
      nextStep: str(formData, "nextStep"),
      primaryOwnerId: str(formData, "primaryOwnerId"),
      secondaryOwnerId: str(formData, "secondaryOwnerId"),
      reasonForPass: str(formData, "reasonForPass"),
      closedAt: newStage === "CLOSED" && before.stage !== "CLOSED" ? new Date() : undefined,
    },
  });

  const authorId = await currentUserId();
  if (newStage !== before.stage) {
    await prisma.activity.create({
      data: {
        dealId,
        type: "STAGE_CHANGE",
        content: `Stage changed to "${newStage}".`,
        authorId,
      },
    });
  }
  if (newStatus !== before.status) {
    await prisma.activity.create({
      data: {
        dealId,
        type: "STATUS_CHANGE",
        content: `Status changed to "${newStatus}".`,
        authorId,
      },
    });
  }

  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function deleteDealAction(dealId: string) {
  await prisma.deal.delete({ where: { id: dealId } });
  revalidatePath("/deals");
  revalidatePath("/pipeline");
  revalidatePath("/");
  redirect("/deals");
}

export async function updateDealStageAction(dealId: string, stage: DealStage) {
  const before = await prisma.deal.findUniqueOrThrow({ where: { id: dealId } });
  if (before.stage === stage) return;

  await prisma.deal.update({
    where: { id: dealId },
    data: {
      stage,
      closedAt: stage === "CLOSED" ? new Date() : before.closedAt,
    },
  });
  await prisma.activity.create({
    data: {
      dealId,
      type: "STAGE_CHANGE",
      content: `Stage changed to "${stage}".`,
      authorId: await currentUserId(),
    },
  });

  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function addActivityAction(dealId: string, formData: FormData) {
  const content = str(formData, "content");
  if (!content) return;
  const type = enumOrNull(str(formData, "type"), [
    "NOTE",
    "CALL",
    "EMAIL",
    "MEETING",
  ] as ActivityType[]) ?? "NOTE";

  await prisma.activity.create({
    data: { dealId, content, type, authorId: await currentUserId() },
  });
  revalidatePath(`/deals/${dealId}`);
}

export async function addTaskAction(dealId: string, formData: FormData) {
  const title = str(formData, "title");
  if (!title) return;
  const dueDate = str(formData, "dueDate");

  await prisma.task.create({
    data: {
      dealId,
      title,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: str(formData, "assigneeId"),
      creatorId: await currentUserId(),
    },
  });
  revalidatePath(`/deals/${dealId}`);
}

export async function toggleTaskAction(taskId: string, dealId: string, completed: boolean) {
  await prisma.task.update({
    where: { id: taskId },
    data: { completed, completedAt: completed ? new Date() : null },
  });
  revalidatePath(`/deals/${dealId}`);
}

export async function deleteTaskAction(taskId: string, dealId: string) {
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/deals/${dealId}`);
}

export async function setPassReasonTagsAction(dealId: string, tagIds: string[]) {
  await prisma.dealPassReasonTag.deleteMany({ where: { dealId } });
  if (tagIds.length) {
    await prisma.dealPassReasonTag.createMany({
      data: tagIds.map((tagId) => ({ dealId, tagId })),
      skipDuplicates: true,
    });
  }
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/");
}
