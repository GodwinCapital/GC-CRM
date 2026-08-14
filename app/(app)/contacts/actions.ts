"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

export async function createContactAction(formData: FormData) {
  const name = str(formData, "name");
  if (!name) return;

  const contact = await prisma.contact.create({
    data: {
      name,
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      title: str(formData, "title"),
      company: str(formData, "company"),
      linkedinUrl: str(formData, "linkedinUrl"),
      notes: str(formData, "notes"),
      sourceId: str(formData, "sourceId"),
    },
  });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContactAction(contactId: string, formData: FormData) {
  await prisma.contact.update({
    where: { id: contactId },
    data: {
      name: str(formData, "name") ?? undefined,
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      title: str(formData, "title"),
      company: str(formData, "company"),
      linkedinUrl: str(formData, "linkedinUrl"),
      notes: str(formData, "notes"),
      sourceId: str(formData, "sourceId"),
    },
  });
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
}

export async function deleteContactAction(contactId: string) {
  await prisma.contact.delete({ where: { id: contactId } });
  revalidatePath("/contacts");
  redirect("/contacts");
}
