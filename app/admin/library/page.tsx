"use client";

import AddBookDialog from "@/components/AddBookDialog";
import BookSelect from "@/components/BookSelect";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth";
import { useUser } from "@clerk/nextjs";

export default function LibraryPage() {
  const { isLoaded, user } = useUser();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

      <span className="w-full flex gap-2 justify-center">
        {alphabet.map((letter) => (
          <Button key={letter} size="icon-sm" variant="outline" className="">
            {letter}
          </Button>
        ))}
      </span>

      <BookSelect />
    </div>
  );
}
