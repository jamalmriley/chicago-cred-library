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
import { useAppContext } from "@/contexts/app-context";
import { useSites } from "@/hooks/use-sites";
import { canCreateUsers, hasPermission, Role, ROLE_OPTIONS } from "@/lib/auth";
import {
  ClerkUser,
  getSiteById,
  getSiteBySalesforceName,
  Participant,
  Site,
  UserType,
} from "@/types/cred";
import { Action, Weekday } from "@/types/data";
import { useUser } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import {
  ChevronDown,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  Trash,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Required from "./Required";
import SiteSelect from "./SiteSelect";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "./ui/attachment";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Spinner } from "./ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const actionInfo = {
  create: {
    title: "Add user",
    description: "Fill out the information below.",
    icon: <Plus />,
    buttonText: {
      default: "Add",
      loading: "Adding",
    },
  },
  read: {
    title: "View user details",
    description: "",
    icon: <Eye />,
    buttonText: {
      default: null,
      loading: null,
    },
  },
  update: {
    title: "Edit user details",
    description: "Edit the information below.",
    icon: <Pencil />,
    buttonText: {
      default: "Update",
      loading: "Updating",
    },
  },
  delete: {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    icon: <Trash />,
    buttonText: {
      default: "Remove",
      loading: "Removing",
    },
  },
};

export default function UserDialog({
  action,
  data,
}: {
  action: Action;
  data?: User;
}) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const tabs: UserType[] = ["Participant", "Staff"];

  if (!user) return;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AbacButton
          user={user}
          action={action}
          resource="participants"
          // This button intentionally requires a lower level
          // of access than "users" so that users who can
          // only add participants can still do so.
          size={action !== "create" ? "icon-xs" : "default"}
          variant={
            action === "delete"
              ? "destructive"
              : action !== "create"
                ? "secondary"
                : "default"
          }
        >
          {actionInfo[action].icon}
          <span className={action !== "create" ? "sr-only" : "molde-button"}>
            {actionInfo[action].title}
          </span>
        </AbacButton>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{actionInfo[action].title}</DialogTitle>
          <DialogDescription>
            {actionInfo[action].description}
          </DialogDescription>
        </DialogHeader>

        {action === "create" ? (
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

            <TabsContent value="Participant">
              <UploadParticipants />
            </TabsContent>
            <TabsContent value="Staff">
              <UserForm
                action={action}
                userData={data}
                setIsDrawerOpen={setIsOpen}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <UserForm
            action={action}
            userData={data}
            setIsDrawerOpen={setIsOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserForm({
  action,
  userData,
  setIsDrawerOpen,
}: {
  action: Action;
  userData?: User;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setLastUpdated } = useAdminContext();
  const { sites } = useSites();
  const { isLoaded, user } = useUser();
  const [, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState(userData?.firstName ?? "");
  const [lastName, setLastName] = useState(userData?.lastName ?? "");
  const [email, setEmail] = useState(
    userData?.emailAddresses[0]?.emailAddress ?? "",
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    (userData?.publicMetadata.role as Role) ?? null,
  );
  const [selectedSite, setSelectedSite] = useState<Site | null>(
    getSiteById(userData?.publicMetadata.defaultSiteId ?? "", sites) ?? null,
  );
  const [isTestData, setIsTestData] = useState(false);

  const isButtonDisabled: boolean =
    firstName === "" || lastName === "" || email === "" || !selectedRole;

  function clearAllFields() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setSelectedRole(null);
    setSelectedSite(null);
    setIsTestData(false);
    setIsOpen(false);
    setIsDrawerOpen(false);
  }

  // User functions
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
  const handleUpdateUser = async (user: ClerkUser) => {
    setIsLoading(true);
    await fetch(`/api/users?id=${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then(() => {
        toast.success(`${user.firstName} was updated successfully!`, {
          position: "bottom-right",
        });
        clearAllFields();
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue updating ${user.firstName}. Please try again.`,
          { position: "bottom-right" },
        );
      })
      .finally(() => setIsLoading(false));
  };
  const handleDeleteUser = async (user: ClerkUser) => {
    setIsLoading(true);
    await fetch(`/api/users?id=${user.id}`, { method: "DELETE" })
      .then(() => {
        toast.success(`${user.firstName} was removed successfully.`, {
          position: "bottom-right",
        });
        clearAllFields();
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue removing ${user.firstName}. Please try again.`,
          {
            position: "bottom-right",
          },
        );
      })
      .finally(() => setIsLoading(false));
  };

  if (!isLoaded || !user) return;
  return (
    <div className="flex flex-col gap-5">
      {action !== "delete" && (
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
                disabled={action === "read"}
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
                disabled={action === "read"}
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
              disabled={action === "read"}
            />
          </Field>

          {/* Birthday, Role, and Site */}
          <span className="flex gap-5">
            {/* Role */}
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
                    disabled={action === "read"}
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
                      disabled={action === "read"}
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

            {/* Site */}
            <Field>
              <FieldLabel htmlFor="site">
                Default Site
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <SiteSelect
                selectedSite={selectedSite}
                setSelectedSite={setSelectedSite}
                isDisabled={action === "read"}
              />
            </Field>
          </span>

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
              disabled={action === "read"}
            />
            <FieldLabel htmlFor="test-data">This is test data.</FieldLabel>
          </AbacField>
        </FieldGroup>
      )}

      {/* Submit Button */}
      {action !== "read" && (
        <Field orientation="horizontal">
          <Button
            type="submit"
            variant={action === "delete" ? "destructive" : "default"}
            className="w-full molde-button"
            disabled={
              isLoading || (action === "delete" ? false : isButtonDisabled)
            }
            onClick={() => {
              if (!selectedRole) return;

              const id = userData?.id ?? null;
              const publicMetadata: UserPublicMetadata = {
                defaultSiteId: selectedSite?.id ?? null,
                isTestUser: isTestData,
                role: selectedRole,
              };
              const user: ClerkUser = {
                id,
                firstName,
                lastName,
                email,
                publicMetadata,
              };

              action === "update"
                ? handleUpdateUser(user)
                : action === "delete"
                  ? handleDeleteUser(user)
                  : handleAddUser(user);
            }}
          >
            {isLoading
              ? `${actionInfo[action].buttonText.loading} ${firstName || "user"}...`
              : `${actionInfo[action].buttonText.default} ${firstName || "user"}`}
            {isLoading && <Spinner data-icon="inline-start" />}
          </Button>
        </Field>
      )}
    </div>
  );
}

function UploadParticipants() {
  const { setLastUpdated } = useAppContext();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      const file = files[0];
      setFile(file);

      interface SalesforceParticipant {
        "Contact ID": string;
        "First Name": string;
        "Last Name": string;
        "Programming Schedule: Days": string;
        "Programming Schedule: Time": string;
        "Participant Status/ Program Phase": string;
        "Programming Site": string;
        Birthdate: string;
        Email: string;
        Mobile: string;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const salesforceJson = (
          XLSX.utils.sheet_to_json(worksheet) as any[]
        ).filter(
          (row) => "Email" in row && "Mobile" in row,
        ) as SalesforceParticipant[];

        const formatBirthdate = (input: string) => {
          const dobArr = input.split("/");
          const month = dobArr[0].length === 1 ? `0${dobArr[0]}` : dobArr[0];
          const day = dobArr[1].length === 1 ? `0${dobArr[1]}` : dobArr[1];

          return [month, day].join("");
        };
        const formatProgramDays = (input: string): Weekday[] => {
          const result: Weekday[] = [];
          const inputArr = input.split(" / ") as (
            | "M"
            | "T"
            | "W"
            | "Th"
            | "F"
          )[];
          if (inputArr.includes("M")) result.push("Monday");
          if (inputArr.includes("T")) result.push("Tuesday");
          if (inputArr.includes("W")) result.push("Wednesday");
          if (inputArr.includes("Th")) result.push("Thursday");
          if (inputArr.includes("F")) result.push("Friday");

          return result;
        };
        const formatGroup = (
          input: string,
        ): "Morning" | "Afternoon" | "All Day" => {
          if (
            input === "Morning" ||
            input === "Afternoon" ||
            input === "All Day"
          ) {
            return input;
          } else {
            return "All Day";
          }
        };

        const participantJson = salesforceJson.map((sf_pp) => {
          const siteSalesforceName =
            sf_pp["Participant Status/ Program Phase"] ===
            "Employment and Training"
              ? sf_pp["Participant Status/ Program Phase"]
              : sf_pp["Programming Site"];

          const participant: Participant = {
            id: sf_pp["Contact ID"],
            first_name: sf_pp["First Name"],
            last_name: sf_pp["Last Name"],
            birthday: formatBirthdate(sf_pp.Birthdate),
            email: sf_pp.Email,
            phone: `+1${sf_pp.Mobile}`,
            siteId:
              getSiteBySalesforceName(siteSalesforceName, sites)?.id ?? "",
            programDays: formatProgramDays(sf_pp["Programming Schedule: Days"]),
            group: formatGroup(sf_pp["Programming Schedule: Time"]),
          };
          return participant;
        });

        setJsonData(participantJson);
      };

      reader.readAsArrayBuffer(file);
    },
    accept: {
      // Modern Excel files
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      // "application/vnd.ms-excel": [".xls"], // Legacy Excel files
      // "text/csv": [".csv"], // CSV files
    },
    multiple: false,
  });
  const { sites } = useSites();
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpsertParticipants = async () => {
    if (!jsonData || jsonData.length === 0) return; // Return early if no participants are available to be added.
    await setIsLoading(true);

    await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    })
      .then(() => {
        toast.success(
          `${jsonData.length} ${jsonData.length === 1 ? "participant" : "participants"} successfully updated.`,
          {
            position: "bottom-right",
          },
        );
        setJsonData([]);
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          "There was an issue updating participants. Please try again.",
          {
            position: "bottom-right",
          },
        );
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <div className="flex flex-col gap-5">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 cursor-pointer transition ${isDragActive ? "border-primary bg-primary/15" : ""}`}
      >
        <input {...getInputProps()} />
        <span className="flex flex-col justify-center items-center">
          <FileSpreadsheet className="size-10 mb-2.5" />
          <p className="text-md font-semibold">
            Drag & drop your file or <span className="underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">Accepted type: .xlsx</p>
        </span>
      </div>
      {file && (
        <Attachment className="w-full">
          <AttachmentMedia>
            <FileSpreadsheet />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              Excel file · {Number(file.size / 1000).toFixed(1)} KB
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              aria-label={`Remove ${file.name}`}
              onClick={() => setFile(null)}
            >
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      )}

      <Button
        type="submit"
        className="w-full molde-button"
        disabled={!jsonData || jsonData.length === 0}
        onClick={handleUpsertParticipants}
      >
        {isLoading
          ? `Adding ${jsonData.length} ${jsonData.length === 1 ? "participant" : "participants"}...`
          : `Add ${jsonData.length === 0 ? "" : jsonData.length + " "}${jsonData.length === 1 ? "participant" : "participants"}`}
        {isLoading && <Spinner data-icon="inline-start" />}
      </Button>
    </div>
  );
}
