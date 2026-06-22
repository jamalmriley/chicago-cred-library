"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermission } from "@/lib/auth";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) return; // TODO: Return a loading state.
  return (
    <div>
      <h1 className="h1">Settings</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {hasPermission({ user, action: "update", resource: "settings" })
          ? "Manage and view"
          : "View"}{" "}
        library settings.
      </p>

      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Manage your site information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>
              Manage how participants check out books.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Return</CardTitle>
            <CardDescription>
              Manage how participants return books.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
