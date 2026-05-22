import { AbacButton } from "@/components/ui/abac";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";

export default async function UsersPage() {
  const { userId } = await auth();
  if (!userId) return;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (
    <div>
      <div className="w-full flex justify-between items-baseline">
        <h1 className="h1">Users</h1>
        <AbacButton user={user} action="create" resource="participants">
          <Plus />
          Add participant
        </AbacButton>
      </div>
      <p>
        This page will be used to manage admin, staff, and participant accounts.
      </p>
    </div>
  );
}
