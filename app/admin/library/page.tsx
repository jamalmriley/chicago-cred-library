"use client";

import AdminBookDialog from "@/components/AdminBookDialog";
import BookSelect from "@/components/BookSelect";
import Checkouts from "@/components/Checkouts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/lib/auth";
import { useUser } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

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

      <Tabs defaultValue="books">
        <TabsList variant="line">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="checkouts">Checkouts</TabsTrigger>
        </TabsList>
        <TabsContent value="books" className="py-5">
          <BookSelect />
        </TabsContent>
        <TabsContent value="checkouts" className="py-5">
          <Checkouts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
