"use client";

import AddUserDialog from "@/components/AddUserDialog";
import { AbacTableCell, AbacTableHead } from "@/components/ui/abac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminContext } from "@/contexts/admin-context";
import { canCreateUsers, hasPermission } from "@/lib/auth";
import { Participant } from "@/types/cred";
import { useUser } from "@clerk/nextjs";
import { formatRelative } from "date-fns";
import { Eye, Pencil, Trash, Users } from "lucide-react";
import { useEffect } from "react";

export default function UsersPage() {
  const {
    lastUpdated,
    participants,
    setParticipants,
    participantsError,
    setParticipantsError,
    participantsLoading,
    setParticipantsLoading,
  } = useAdminContext();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    const fetchParticipants = async () => {
      await setParticipantsLoading(true);
      const res = await fetch("/api/participants");

      if (!res.ok) {
        setParticipantsLoading(false);
        setParticipants(null);
        setParticipantsError("There was an error loading participants.");
        console.error(await res.json());
        return;
      }

      const data: Participant[] = await res.json();
      setParticipantsLoading(false);
      setParticipants(data);
      setParticipantsError(null);
    };

    fetchParticipants();
  }, [lastUpdated]);

  if (!isLoaded || !user) return;
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
        {[canCreateUsers(user) ? "staff" : "", "participants"]
          .filter((el) => el !== "")
          .join(" and ")}
        .
      </p>

      <h2 className="h2">Participants</h2>

      {/* No users */}
      <div className="w-full h-fit flex flex-col flex-1 grow justify-center items-center border rounded-xl p-10 bg-muted text-muted-foreground">
        <Users className="size-20" />
        <p className="text-lg font-medium text-muted-foreground mb-5 select-none">
          No participants added yet.
        </p>
      </div>

      {/* No users */}
      <div className="w-full h-fit flex flex-col flex-1 grow justify-center items-center border rounded-xl p-10 bg-destructive text-destructive-foreground">
        <Users className="size-20" />
        <p className="text-lg font-medium text-destructive-foreground mb-5 select-none">
          Error loading participants.
        </p>
      </div>

      {/* TODO: Add a filter and sort button on the left and a view button on the right to display certain columns. */}
      {participantsLoading ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              {/* className="w-[100px]" */}
              {/* className="text-right" */}
              <TableHead>Name</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Books</TableHead>
              <TableHead>Created at</TableHead>
              <AbacTableHead
                user={user}
                action="update"
                resource="participants"
                className="text-center"
              >
                Actions
              </AbacTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  <Skeleton className="w-30 h-5" />
                </TableCell>
                <TableCell>
                  {/* bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 */}
                  <Skeleton key={i} className="w-15 h-5 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-30 h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-30 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-30 h-4" />
                </TableCell>
                <AbacTableCell
                  user={user}
                  action="update"
                  resource="participants"
                  className="flex justify-center items-center gap-1.5"
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="size-6 rounded-lg" />
                  ))}
                </AbacTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : participantsError ? (
        <>error</>
      ) : participants && participants.length > 0 ? (
        <Table className="border">
          <TableHeader>
            <TableRow>
              {/* className="w-[100px]" */}
              {/* className="text-right" */}
              <TableHead>Name</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Books</TableHead>
              <TableHead>Created at</TableHead>
              <AbacTableHead
                user={user}
                action="update"
                resource="participants"
                className="text-center"
              >
                Actions
              </AbacTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  {participant.first_name} {participant.last_name}
                </TableCell>
                <TableCell>
                  {/* bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 */}
                  <Badge>{participant.site.nickname}</Badge>
                </TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {participant.checkout_history
                    ? `${participant.checkout_history.length} book${participant.checkout_history.length === 1 ? "" : "s"}`
                    : "No books read yet"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatRelative(participant.created_at, new Date())}
                </TableCell>
                <AbacTableCell
                  user={user}
                  action="update"
                  resource="participants"
                  className="flex justify-center items-center gap-1.5"
                >
                  <Button size="icon-xs" variant="secondary" disabled>
                    <Eye />
                    <span className="sr-only">View participant</span>
                  </Button>

                  <Button size="icon-xs" variant="secondary" disabled>
                    <Pencil />
                    <span className="sr-only">Edit participant</span>
                  </Button>

                  <Button size="icon-xs" variant="destructive" disabled>
                    <Trash />
                    <span className="sr-only">Inactivate participant</span>
                  </Button>
                </AbacTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <>no participants</>
      )}

      <h2 className="h2">Staff</h2>
    </div>
  );
}
