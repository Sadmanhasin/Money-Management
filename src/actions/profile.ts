"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema, changePasswordSchema } from "@/lib/validations";

export type ProfileState = { error?: string; success?: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile data" };
  }

  const { name, email } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { error: "An account with this email already exists" };
  }

  await prisma.user.update({ where: { id: userId }, data: { name, email } });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Profile updated" };
}

export async function changePasswordAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const userId = await requireUserId();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password data" };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "User not found" };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

  await signOut({ redirectTo: "/login" });
  return undefined;
}
