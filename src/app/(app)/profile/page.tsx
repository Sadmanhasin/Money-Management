import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/current-user";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";

export default async function ProfilePage() {
  const session = await auth();
  const currentUser = await getCurrentUser(session!.user.id);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
          <UserAvatar name={currentUser?.name} email={currentUser?.email} size="xl" />
          <div>
            <p className="text-lg font-semibold">{currentUser?.name || "Unnamed User"}</p>
            <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <EditProfileDialog name={currentUser?.name ?? ""} email={currentUser?.email ?? ""} />
            <ChangePasswordDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
