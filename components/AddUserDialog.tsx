"use client";

import {
  AbacButton,
  AbacDropdownMenuCheckboxItem,
  AbacField,
} from "@/components/ui/abac";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAdminContext } from "@/contexts/admin-context";
import { canCreateUsers, hasPermission, Role, ROLE_OPTIONS } from "@/lib/auth";
import { ClerkUser, Participant, Site, SITES, UserType } from "@/types/cred";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Required from "./Required";
import SiteDropdownMenuContent from "./SiteDropdownMenuContent";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Spinner } from "./ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

export default function AddUserDialog() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const tabs: UserType[] = ["Participant", "Staff"];

  if (!user) return;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AbacButton
          user={user}
          action="create"
          resource="participants"
          // This button intentionally requires a lower level
          // of access than "users" so that users who can
          // only add participants can still do so.
        >
          <UserPlus />
          Add user
        </AbacButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a user</DialogTitle>
          <DialogDescription>Fill out the information below.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={tabs[0]}>
          <TabsList variant="line" className="mb-5">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                disabled={
                  tab === "Participant"
                    ? !hasPermission({
                        user,
                        action: "create",
                        resource: "participants",
                      })
                    : !canCreateUsers(user)
                }
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <AddUserForm userType={tab} setIsDrawerOpen={setIsOpen} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AddUserForm({
  userType,
  setIsDrawerOpen,
}: {
  userType: UserType;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setLastUpdated } = useAdminContext();
  const { isLoaded, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [notes, setNotes] = useState("");

  const [isTestData, setIsTestData] = useState(false);

  const isButtonDisabled: boolean =
    firstName === "" || lastName === "" || email === "";
  const isParticipantButtonDisabled: boolean =
    isButtonDisabled || birthday === "" || !selectedSite || notes === "";
  const isStaffButtonDisabled: boolean = isButtonDisabled || !selectedRole;

  const formatBirthday = (input: string): string => {
    const findNthOccurrence = (
      str: string,
      char: string,
      n: number,
    ): number => {
      let index = -1;
      for (let i = 0; i < n; i++) {
        index = str.indexOf(char, index + 1);
        if (index === -1) break; // Not enough occurrences found
      }
      return index;
    };

    const daysPerMonth: Map<number, number> = new Map([
      [1, 31],
      [2, 29],
      [3, 31],
      [4, 30],
      [5, 31],
      [6, 30],
      [7, 31],
      [8, 31],
      [9, 30],
      [10, 31],
      [11, 30],
      [12, 31],
    ]);

    // Strip everything except digits and slashes
    const cleaned = input.replace(/[^\d/]/g, "");

    // Extract only digits
    const digits = cleaned.replace(/\//g, "");

    if (digits.length > 4) return birthday;

    // Auto-prefix 0 if first digit is 2-9 (can't be a valid month start)
    if (digits.length === 1 && parseInt(digits[0]) >= 2) {
      return `0${digits[0]}/`;
    }

    // Auto-prefix 0 if first digit and a slash are typed (for January)
    if (
      cleaned.length === 2 &&
      parseInt(cleaned[0]) !== 0 &&
      cleaned[1] === "/"
    ) {
      return `0${digits[0]}/`;
    }

    // Don't allow double zeroes in the month
    if (digits.length === 2 && parseInt(digits[0] + digits[1]) === 0) {
      return "0";
    }

    // Don't allow the month to exceed 12
    if (parseInt(digits.slice(0, 2)) > 12) {
      return "";
    }

    // Only allow for one slash
    if (cleaned.split("").filter((char) => char === "/").length > 1) {
      return cleaned.substring(0, findNthOccurrence(cleaned, "/", 2));
    }

    // Don't allow double zeroes in the day
    if (
      digits.length === 4 &&
      parseInt(digits[2]) === 0 &&
      parseInt(digits[3]) === 0
    ) {
      return `${digits[0]}${digits[1]}/${digits[2]}`;
    }

    if (digits.length >= 3) {
      const [month, day] = [digits.slice(0, 2), digits.slice(2)];

      // Auto-prefix 0 if first digit of day is 4-9
      if (day.length === 1 && parseInt(day[0]) >= 4) {
        return `${month}/0${day[0]}`;
      }

      // Don't allow the day to exceed the number of days in a given month
      if (digits.length === 4) {
        const daysInMonth = daysPerMonth.get(parseInt(month)) ?? 31;
        if (parseInt(day) > daysInMonth) return `${month}/${daysInMonth}`;
      }

      return `${month}/${day}`;
    }

    if (cleaned.includes("/")) {
      const [month, day] = cleaned.split("/");
      if (month.length <= 2 && day.length <= 2) return cleaned;
      return birthday;
    }

    return digits;
  };

  const clearAllFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setBirthday("");
    setSelectedRole(null);
    setSelectedSite(null);
    setNotes("");
    setIsTestData(false);
    setIsOpen(false);
    setIsDrawerOpen(false);
  };

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBirthday(e.target.value);
    setBirthday(formatted);
  };

  const handleAddParticipant = async (user: Participant) => {
    await setIsLoading(true);

    await fetch(`/api/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then(() => {
        toast.success(`${user.first_name} was added successfully!`, {
          position: "bottom-right",
        });
        clearAllFields();
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue adding ${user.first_name}. Please try again.`,
          {
            position: "bottom-right",
          },
        );
      })
      .finally(() => setIsLoading(false));
  };

  const handleAddUser = async (user: ClerkUser) => {
    await setIsLoading(true);

    await fetch(`/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then(() => {
        toast.success(
          `An invitation has been sent to ${user.firstName} at ${user.email} to create an account.`,
          {
            position: "bottom-right",
          },
        );
        clearAllFields();
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue adding ${user.firstName}. Please try again.`,
          {
            position: "bottom-right",
          },
        );
      })
      .finally(() => setIsLoading(false));
  };

  if (!isLoaded || !user) return;
  return (
    <Card className="p-5">
      <FieldGroup>
        {/* First and Last Name */}
        <span className="flex gap-5">
          <Field>
            <FieldLabel htmlFor="first-name">
              First Name
              <Required />
            </FieldLabel>
            <Input
              autoComplete="given-name"
              id="first-name"
              placeholder="John"
              required
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="last-name">
              Last Name
              <Required />
            </FieldLabel>
            <Input
              autoComplete="family-name"
              id="last-name"
              placeholder="Doe"
              required
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
        </span>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">
            Email
            <Required />
          </FieldLabel>
          <Input
            autoComplete="email"
            id="email"
            placeholder="john@example.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        {/* Birthday, Role, and Site */}
        <span className="flex gap-5">
          {/* Birthday */}
          {userType === "Participant" && (
            <Field>
              <FieldLabel htmlFor="birthday">
                Birthday
                <Required />
              </FieldLabel>
              <Input
                autoComplete="bday"
                id="birthday"
                placeholder="MM/DD"
                required
                type="text"
                value={birthday}
                onChange={handleBirthdayChange}
                maxLength={5} // MM/DD
              />
            </Field>
          )}

          {/* Role */}
          {userType === "Staff" && (
            <Field>
              <FieldLabel htmlFor="role">
                Role
                <Required />
              </FieldLabel>

              <DropdownMenu>
                <DropdownMenuTrigger asChild id="role">
                  <Button
                    variant="outline"
                    className={`flex justify-between ${selectedRole ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {selectedRole
                      ? ROLE_OPTIONS.filter(
                          (role) => role.value === selectedRole,
                        )[0].name
                      : "Select a role"}
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit">
                  {ROLE_OPTIONS.map((role, i) => (
                    <AbacDropdownMenuCheckboxItem
                      key={i}
                      className="flex flex-col justify-center items-start gap-0"
                      checked={role.value === selectedRole}
                      onCheckedChange={() => setSelectedRole(role.value)}
                      user={user}
                      resource="users"
                      action="create"
                      // Verify that the role can be created by the user
                      data={{ user, targetRole: role.value as Role }}
                    >
                      <Item size="xs" className="p-0">
                        <ItemContent>
                          <ItemTitle className="whitespace-nowrap">
                            {role.name}
                          </ItemTitle>
                          <ItemDescription>{role.description}</ItemDescription>
                        </ItemContent>
                      </Item>
                    </AbacDropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>
          )}

          {/* Site */}
          <Field>
            <FieldLabel htmlFor="site">
              {userType === "Participant" ? "Site" : "Default Site"}
              {userType === "Participant" ? (
                <Required />
              ) : (
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              )}
            </FieldLabel>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild id="site">
                <Button
                  variant="outline"
                  className={`flex justify-between ${selectedSite ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {selectedSite
                    ? SITES.filter(
                        (site) =>
                          JSON.stringify(site) === JSON.stringify(selectedSite),
                      )[0].nickname
                    : "Select a site"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <SiteDropdownMenuContent
                selectedSite={selectedSite}
                setSelectedSite={setSelectedSite}
              />
            </DropdownMenu>
          </Field>
        </span>

        {/* Notes */}
        {userType === "Participant" && (
          <Field>
            <FieldLabel htmlFor="notes">
              Participant Notes{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id="notes"
              placeholder="(e.g., prefers non-fiction)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        )}

        {/* Test Data */}
        <AbacField
          orientation="horizontal"
          user={user}
          action="create"
          resource="test_data"
        >
          <Checkbox
            id="test-data"
            name="test-data"
            checked={isTestData}
            onCheckedChange={() => setIsTestData((prev) => !prev)}
          />
          <FieldLabel htmlFor="test-data">This is test data.</FieldLabel>
        </AbacField>
      </FieldGroup>

      {/* Submit Button */}
      <Field orientation="horizontal">
        <Button
          type="submit"
          className="w-full"
          disabled={
            isLoading ||
            (userType === "Participant"
              ? isParticipantButtonDisabled
              : isStaffButtonDisabled)
          }
          onClick={() => {
            if (userType === "Participant") {
              if (!selectedSite) return;

              const created_at = new Date();
              const id = `${isTestData ? "test_" : ""}${crypto.randomUUID()}`;
              const formattedBirthday = birthday.replace("/", "");

              const participant: Participant = {
                // TODO: Though unlikely, make sure ID and email aren't already in use.
                id,
                created_at,
                first_name: firstName,
                last_name: lastName,
                birthday: formattedBirthday,
                email,
                site: selectedSite,
                notes,
                checkout_history: null,
                updated_at: created_at,
              };

              handleAddParticipant(participant);
            } else if (userType === "Staff") {
              if (!selectedRole) return;
              const publicMetadata: UserPublicMetadata = {
                defaultSite: selectedSite as Site,
                role: selectedRole,
                isTestUser: isTestData,
              };
              const user: ClerkUser = {
                firstName,
                lastName,
                email,
                publicMetadata,
              };
              handleAddUser(user);
            }
          }}
        >
          {isLoading
            ? `${userType === "Staff" ? "Inviting" : "Adding"} ${firstName || userType.toLowerCase()}...`
            : `${userType === "Staff" ? "Invite" : "Add"} ${firstName || userType.toLowerCase()}`}
          {isLoading && <Spinner data-icon="inline-start" />}
        </Button>
      </Field>
    </Card>
  );
}
