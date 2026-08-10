import "server-only";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `RESEND_API_KEY is not set; no email sent. Password reset link for ${to}:\n${resetUrl}`
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Money Management <onboarding@resend.dev>",
      to,
      subject: "Reset your Money Management password",
      html: `
        <p>We received a request to reset your Money Management password.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Failed to send password reset email:", response.status, body);
  }
}
