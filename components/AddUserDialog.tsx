"use client";

import { AbacButton, AbacDropdownMenuCheckboxItem } from "@/components/ui/abac";
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
import { hasPermission, PermissionUser, Role, ROLE_OPTIONS } from "@/lib/auth";
import { Site, SITES } from "@/types/cred";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

type UserType = "Participant" | "Staff";

export default function AddUserDialog() {
  const { user } = useUser();
  const tabs: UserType[] = ["Participant", "Staff"];

  if (!user) return;

  const canCreateUsers = (user: PermissionUser): boolean =>
    ROLE_OPTIONS.some((roleOption) =>
      hasPermission({
        user,
        action: "create",
        resource: "users",
        data: { user, targetRole: roleOption.value as Role },
      }),
    );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <AbacButton
          user={user}
          action="create"
          resource="participants"
          variant="secondary"
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
              <AddUserForm userType={tab} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Required() {
  return <span className="text-destructive">*</span>;
}

function AddUserForm({ userType }: { userType: UserType }) {
  const { isLoaded, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedSites, setSelectedSites] = useState<Site[]>([]);
  const [notes, setNotes] = useState("");

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
    if (digits.length === 4 && parseInt(digits[2]) === 0) {
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
  const groupSitesByRegion = () => {
    const regions = [...new Set(SITES.map((site) => site.region))];
    return regions.map((region) => ({
      name: region,
      sites: SITES.filter((site: Site) => site.region === region),
    }));
  };
  const regions = groupSitesByRegion();

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBirthday(e.target.value);
    setBirthday(formatted);
  };

  const handleCheckedChange = (site: Site, isChecked: boolean) => {
    setSelectedSites(
      (prev) =>
        isChecked
          ? prev.filter((s) => s.value !== site.value) // Remove site from list
          : [...prev, site], // Add site to list
    );
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
        <span
          className="flex gap-5"
          // className={`flex gap-5 ${userType === "Staff" ? "flex-col" : "flex-row"}`}
        >
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
              {`Site${userType === "Participant" ? "" : "(s)"}`}
              <Required />
            </FieldLabel>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild id="site">
                <Button
                  variant="outline"
                  className={`flex justify-between ${selectedSite || selectedSites.length > 0 ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {userType === "Participant"
                    ? selectedSite
                      ? SITES.filter(
                          (site) =>
                            JSON.stringify(site) ===
                            JSON.stringify(selectedSite),
                        )[0].value
                      : "Select a site"
                    : selectedSites && selectedSites.length > 0
                      ? selectedSites.length === 1
                        ? selectedSites[0].value
                        : `${selectedSites.length} sites`
                      : "Select site(s)"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit">
                {regions.map((region, i) => (
                  <DropdownMenuGroup key={i}>
                    {region.name !== "Chicago" && (
                      <DropdownMenuLabel>{region.name}</DropdownMenuLabel>
                    )}
                    {region.sites.map((site, j) => (
                      <DropdownMenuCheckboxItem
                        key={j}
                        className="flex flex-col justify-center items-start gap-0"
                        checked={
                          userType === "Participant"
                            ? JSON.stringify(site) ===
                              JSON.stringify(selectedSite)
                            : selectedSites.some((s) => s.value === site.value)
                        }
                        onCheckedChange={() => {
                          if (userType === "Participant") {
                            setSelectedSite(site);
                          } else {
                            const isChecked = selectedSites.some(
                              (s) => s.value === site.value,
                            );
                            handleCheckedChange(site, isChecked);
                          }
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Item size="xs" className="p-0">
                          <ItemContent>
                            <ItemTitle className="whitespace-nowrap">
                              {site.name}
                            </ItemTitle>
                            <ItemDescription>
                              {[
                                site.name === site.value ? "" : `${site.value}`,
                                site.neighborhood === "Chicago"
                                  ? ""
                                  : site.neighborhood,
                              ]
                                .filter((el) => el !== "")
                                .join(" | ")}
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      </DropdownMenuCheckboxItem>
                    ))}
                    {i < regions.length - 1 && <DropdownMenuSeparator />}
                  </DropdownMenuGroup>
                ))}
                {userType === "Staff" && (
                  <>
                    <DropdownMenuSeparator />
                    <Button className="w-full" onClick={() => setIsOpen(false)}>
                      Done
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
        </span>

        {/* Notes */}
        {userType === "Participant" && (
          <Field>
            <FieldLabel htmlFor="notes">
              Participant Notes{" "}
              <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id="notes"
              placeholder="(e.g., prefers non-fiction)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        )}
      </FieldGroup>

      {/* Buttons */}
      <Field orientation="horizontal">
        <Button type="submit" className="w-full">
          Add {firstName || userType.toLowerCase()}
        </Button>
      </Field>
    </Card>
  );
}
