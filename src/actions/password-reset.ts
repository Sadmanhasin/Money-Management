"use server";

import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";

export type ForgotPasswordState = { error?: string; success?: string } | undefined;
export type ResetPasswordState = { error?: string; success?: string } | undefined;

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getBaseUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const proto =
    requestHeaders.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const GENERIC_SUCCESS = "If an account exists for that email, we've sent a password reset link.";

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);

      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const baseUrl = await getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(email, resetUrl);
    }
  } catch (error) {
    console.error("Password reset request failed:", error);
  }

  return { success: GENERIC_SUCCESS };
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid reset request" };
  }

  const { token, newPassword } = parsed.data;
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  return { success: "Your password has been reset. You can now sign in." };
}
