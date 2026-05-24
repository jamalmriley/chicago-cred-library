import AddUserDialog from "@/components/AddUserDialog";

export default async function UsersPage() {
  return (
    <div>
      <div className="w-full flex justify-between items-baseline">
        <h1 className="h1">Users</h1>
        <div className="flex gap-5">
          <AddUserDialog />
        </div>
      </div>
      <p>Manage admin, staff, and participant accounts.</p>
    </div>
  );
}
