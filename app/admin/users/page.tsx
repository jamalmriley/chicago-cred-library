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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminContext } from "@/contexts/admin-context";
import { canCreateUsers, hasPermission, ROLE_OPTIONS } from "@/lib/auth";
import { Participant, UserType } from "@/types/cred";
import { useUser } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import { formatRelative } from "date-fns";
import { Eye, Pencil, RotateCcw, Trash, UserX } from "lucide-react";
import { useEffect } from "react";

export default function UsersPage() {
  const {
    lastUpdated,
    setParticipants,
    setParticipantsError,
    setParticipantsLoading,
    setUsers,
    setUsersError,
    setUsersLoading,
  } = useAdminContext();
  const { isLoaded, user } = useUser();
  const tabs: UserType[] = ["Participant", "Staff"];
  const tabContent = {
    Participant: <ParticipantTable />,
    Staff: <UserTable />,
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      await setParticipantsLoading(true);
      const res = await fetch("/api/participants");

      if (!res.ok) {
        setParticipantsLoading(false);
        setParticipants(null);
        setParticipantsError("There was an error loading participants.");
        // console.error(await res.json());
        return;
      }

      const data: Participant[] = await res.json();
      setParticipantsLoading(false);
      setParticipants(data);
      setParticipantsError(null);
    };

    const fetchUsers = async () => {
      await setParticipantsLoading(true);
      const res = await fetch("/api/users");

      if (!res.ok) {
        setUsersLoading(false);
        setUsers(null);
        setUsersError("There was an error loading staff.");
        // console.error(await res.json());
        return;
      }

      const data: User[] = await res.json();
      setUsersLoading(false);
      setUsers(data);
      setUsersError(null);
    };

    fetchParticipants();
    fetchUsers();
  }, [lastUpdated]);

  if (!isLoaded || !user) return; // TODO: Return a loading state.
  return (
    <div>
      <div className="w-full flex justify-between items-baseline">
        <h1 className="h1">Users</h1>
        <AddUserDialog />
      </div>

      {/* Manage and/or view staff and/or participants. */}
      <p className="mb-5 text-sm text-muted-foreground">
        {canCreateUsers(user) ||
        hasPermission({ user, action: "create", resource: "participants" })
          ? "Manage and view"
          : "View"}{" "}
        staff and participants.
      </p>

      <Tabs defaultValue={tabs[0]}>
        <TabsList variant="line" className="mb-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab + (tab === "Staff" ? "" : "s")}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            {tabContent[tab]}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Fallback({
  userType,
  fallback,
}: {
  userType: UserType;
  fallback: "none" | "error";
}) {
  const { setLastUpdated } = useAdminContext();
  const refresh = () => setLastUpdated(new Date().toString());
  return (
    <div
      className={`w-full h-fit flex flex-col flex-1 grow justify-center items-center p-10 border rounded-xl ${fallback === "error" ? "border-destructive bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
    >
      <UserX className="size-20" />
      <p className="text-lg font-medium mb-5 select-none">
        {fallback === "none"
          ? `No ${userType === "Staff" ? userType.toLowerCase() : userType.toLowerCase() + "s"} added yet.`
          : fallback === "error"
            ? `Error loading ${userType === "Staff" ? userType.toLowerCase() : userType.toLowerCase() + "s"}.`
            : "Nothing to display."}
      </p>
      {fallback === "none" ? (
        <div className="flex gap-5">
          <AddUserDialog />
          <Button onClick={refresh} variant="outline">
            <RotateCcw />
            Refresh
          </Button>
        </div>
      ) : (
        <Button onClick={refresh}>
          <RotateCcw />
          Try again
        </Button>
      )}
    </div>
  );
}

function ParticipantTable() {
  const { participants, participantsError, participantsLoading } =
    useAdminContext();
  const { user } = useUser();

  if (!user) return;
  return (
    <>
      {/* TODO: Add a filter and sort button on the left and a view button on the right to display certain columns. */}
      {participantsLoading ? (
        <Table className="border">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Site</TableHead>
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
                <TableCell className="flex justify-center">
                  <Skeleton key={i} className="w-15 h-5 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-30 h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-30 h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-30 h-5" />
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
        <Fallback userType="Participant" fallback="error" />
      ) : participants && participants.length > 0 ? (
        <Table className="border">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Site</TableHead>
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
                <TableCell className="text-center">
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
        <Fallback userType="Participant" fallback="none" />
      )}
    </>
  );
}

function UserTable() {
  const { users, usersError, usersLoading } = useAdminContext();
  const { user } = useUser();
  const getRoleName = (value: string | undefined): string => {
    let result = "None";
    if (!value) return result;
    for (const role of ROLE_OPTIONS) {
      if (role.value === value) {
        result = role.name;
        break;
      }
    }
    return result;
  };

  if (!user) return;
  return (
    <>
      {/* TODO: Add a filter and sort button on the left and a view button on the right to display certain columns. */}
      {usersLoading ? (
        <Table className="border">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-27 text-center">Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Default Site</TableHead>
              <TableHead className="text-center">Created at</TableHead>
              <AbacTableHead
                user={user}
                action="update"
                resource="users"
                className="text-center"
              >
                Actions
              </AbacTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                {/* Name */}
                <TableCell className="font-medium">
                  <Skeleton className="w-30 h-5" />
                </TableCell>
                {/* Role */}
                <TableCell className="flex justify-center">
                  <Skeleton key={i} className="w-27 h-5 rounded-full" />
                </TableCell>
                {/* Email */}
                <TableCell>
                  <Skeleton className="w-40 h-5" />
                </TableCell>
                {/* Default Site */}
                <TableCell className="text-center">
                  <Skeleton className="w-20 h-4" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="w-30 h-4" />
                </TableCell>
                <AbacTableCell
                  user={user}
                  action="update"
                  resource="users"
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
      ) : usersError ? (
        <Fallback userType="Staff" fallback="error" />
      ) : users && users.length > 0 ? (
        <Table className="border">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-27 text-center">Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Default Site</TableHead>
              <TableHead className="text-center">Created at</TableHead>
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
            {users.map((userAccount, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  {userAccount.firstName} {userAccount.lastName}
                </TableCell>
                <TableCell className="w-27 text-center">
                  <Badge>{getRoleName(userAccount.publicMetadata.role)}</Badge>
                </TableCell>
                <TableCell>
                  {userAccount.emailAddresses[0].emailAddress}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {userAccount.publicMetadata.defaultSite
                    ? userAccount.publicMetadata.defaultSite.nickname
                    : "None"}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {formatRelative(userAccount.createdAt, new Date())}
                </TableCell>
                <AbacTableCell
                  user={user}
                  action="update"
                  resource="users"
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
        <Fallback userType="Staff" fallback="none" />
      )}
    </>
  );
}
