import AddUserDialog from "@/components/AddUserDialog";
import { canCreateUsers, hasPermission } from "@/lib/auth";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function UsersPage() {
  const user = await currentUser();

  if (!user) return;
  return (
    <div>
      <div className="w-full flex justify-between items-baseline">
        <h1 className="h1">Users</h1>
        <div className="flex gap-5">
          <AddUserDialog />
        </div>
      </div>

      {/* Manage and/or view staff and/or participants. */}
      <p>
        {canCreateUsers(user) ||
        hasPermission({ user, action: "create", resource: "participants" })
          ? "Manage and view"
          : "View"}{" "}
        {[
          canCreateUsers(user) ? "staff" : "",
          hasPermission({ user, action: "create", resource: "participants" })
            ? "participants"
            : "",
        ]
          .filter((el) => el !== "")
          .join(" and ")}
        .
      </p>
    </div>
  );
}
