"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Wallet, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, undefined);

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="size-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-sm text-destructive">This reset link is invalid or missing.</p>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-foreground underline underline-offset-4"
              >
                Request a new link
              </Link>
            </div>
          ) : state?.success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="size-8 text-[#0ca30c]" />
              <p className="text-sm text-muted-foreground">{state.success}</p>
              <Link href="/login" className="text-sm font-medium text-foreground underline underline-offset-4">
                Go to sign in
              </Link>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="token" value={token} />
              <div className="flex flex-col gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  minLength={8}
                  required
                />
              </div>
              {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
              <Button type="submit" className="mt-2 w-full" disabled={isPending}>
                {isPending ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
