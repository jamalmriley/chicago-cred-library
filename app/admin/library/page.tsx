"use client";

import AdminBookDialog from "@/components/AdminBookDialog";
import BookSelect from "@/components/BookSelect";
import { hasPermission } from "@/lib/auth";
import { useUser } from "@clerk/nextjs";

export default function LibraryPage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) return; // TODO: Return a loading state.
  return (
    <div>
      <div className="w-full flex justify-between items-baseline">
        <h1 className="h1">Library</h1>
        <AdminBookDialog action="create" />
      </div>

      {/* Manage and/or view staff and/or participants. */}
      <p className="mb-5 text-sm text-muted-foreground">
        {hasPermission({ user, action: "create", resource: "books" })
          ? "Manage and view"
          : "View"}{" "}
        our library.
      </p>

      <BookSelect />
    </div>
  );
}
