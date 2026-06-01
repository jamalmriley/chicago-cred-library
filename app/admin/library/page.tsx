"use client";

import AddBookDialog from "@/components/AddBookDialog";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth";
import { useUser } from "@clerk/nextjs";

export default function LibraryPage() {
  const { isLoaded, user } = useUser();
  if (!isLoaded || !user) return; // TODO: Return a loading state.
  return (
    <div>
      <div className="w-full flex justify-between items-baseline">
        <h1 className="h1">Library</h1>
        <AddBookDialog />
      </div>

      {/* Manage and/or view staff and/or participants. */}
      <p className="mb-5 text-sm text-muted-foreground">
        {hasPermission({ user, action: "create", resource: "books" })
          ? "Manage and view"
          : "View"}{" "}
        our library.
      </p>
    </div>
  );
}
