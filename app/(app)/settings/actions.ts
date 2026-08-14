"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Only admins can perform this action.");
  }
  return session.user;
}

export async function changeMyPasswordAction(
  _prev: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const currentPassword = str(formData, "currentPassword");
  const newPassword = str(formData, "newPassword");
  if (!currentPassword || !newPassword) return { error: "All fields are required." };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { success: "Password updated." };
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const initials = str(formData, "initials");
  const email = str(formData, "email")?.toLowerCase();
  const password = str(formData, "password");
  const role = str(formData, "role") === "ADMIN" ? "ADMIN" : "MEMBER";
  if (!name || !initials || !email || !password) return;

  await prisma.user.create({
    data: {
      name,
      initials: initials.toUpperCase(),
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
    },
  });
  revalidatePath("/settings");
}

export async function resetUserPasswordAction(userId: string, formData: FormData) {
  await requireAdmin();
  const password = str(formData, "password");
  if (!password || password.length < 8) return;
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidatePath("/settings");
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return;
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (target?.role === "ADMIN" && adminCount <= 1) return;
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/settings");
}

export async function createTagAction(formData: FormData) {
  const label = str(formData, "label");
  if (!label) return;
  await prisma.passReasonTag.upsert({ where: { label }, create: { label }, update: {} });
  revalidatePath("/settings");
}

export async function deleteTagAction(tagId: string) {
  await prisma.passReasonTag.delete({ where: { id: tagId } });
  revalidatePath("/settings");
}
