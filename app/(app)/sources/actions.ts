"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { SourceType } from "@prisma/client";

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

export async function createSourceAction(formData: FormData) {
  const name = str(formData, "name");
  if (!name) return;
  const type = (str(formData, "type") as SourceType) ?? "OTHER";

  const source = await prisma.source.create({
    data: {
      name,
      type: SOURCE_TYPE_VALUES.includes(type) ? type : "OTHER",
      website: str(formData, "website"),
      notes: str(formData, "notes"),
    },
  });

  revalidatePath("/sources");
  redirect(`/sources/${source.id}`);
}

export async function updateSourceAction(sourceId: string, formData: FormData) {
  const type = str(formData, "type") as SourceType | null;

  await prisma.source.update({
    where: { id: sourceId },
    data: {
      name: str(formData, "name") ?? undefined,
      type: type && SOURCE_TYPE_VALUES.includes(type) ? type : undefined,
      website: str(formData, "website"),
      notes: str(formData, "notes"),
    },
  });
  revalidatePath("/sources");
  revalidatePath(`/sources/${sourceId}`);
}

export async function deleteSourceAction(sourceId: string) {
  await prisma.source.delete({ where: { id: sourceId } });
  revalidatePath("/sources");
  redirect("/sources");
}
