import { Participant } from "@/types/cred";
import { GoogleBooks } from "@/types/library";

export const ROLE_OPTIONS = [
  {
    name: "Super Admin",
    value: "super_admin",
    description: "Full platform access.",
  },
  {
    name: "Admin",
    value: "admin",
    description: "Manages staff, participants, and books.",
  },
  {
    name: "Staff",
    value: "staff",
    description: "Manages participants and books.",
  },
  {
    name: "Viewer",
    value: "viewer",
    description: "View-only access.",
  },
] as const;

export type Role = (typeof ROLE_OPTIONS)[number]["value"];

export type PermissionUser = {
  id: string;
  publicMetadata: {
    role?: Role;
  };
};

type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: PermissionUser, data: Permissions[Key]["dataType"]) => boolean);

type RolesWithPermissions = {
  [R in Role]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]["action"]]: PermissionCheck<Key>;
    }>;
  }>;
};

export type Permissions = {
  library: {
    dataType: GoogleBooks.LibraryBook;
    action: "create" | "read" | "update" | "delete";
  };
  participants: {
    dataType: Participant;
    action: "create" | "read" | "update" | "delete";
  };
  users: {
    dataType: { user: PermissionUser; targetRole?: Role };
    action: "create" | "read" | "update" | "delete";
  };
};

// Checks if the target role (i.e. the user) has access to the listed (i.e. accessible) roles.
const hasRoleAccess = (
  targetRole: Role | undefined,
  accessibleRoles: Role[],
): boolean => targetRole !== undefined && accessibleRoles.includes(targetRole);

const handleUpdate = (user: PermissionUser, target: PermissionUser): boolean =>
  user.id === target.id;

const ROLE_PERMISSIONS = {
  // Super admins have unrestricted access.
  super_admin: {
    library: { create: true, read: true, update: true, delete: true },
    participants: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
  },
  // Admins can create and update staff/viewers, but they can also update their own profile.
  admin: {
    library: { create: true, read: true, update: true, delete: false },
    participants: { create: true, read: true, update: true, delete: false },
    users: {
      create: (_, { targetRole }) =>
        hasRoleAccess(targetRole, ["staff", "viewer"]),
      read: true,
      update: (user, { user: target, targetRole }) =>
        hasRoleAccess(targetRole, ["staff", "viewer"]) ||
        handleUpdate(user, target),
      delete: false,
    },
  },
  // Staff can update their own profile.
  staff: {
    library: { create: true, read: true, update: true, delete: false },
    participants: { create: true, read: true, update: true, delete: false },
    users: {
      create: false,
      read: true,
      update: (user, { user: target }) => handleUpdate(user, target),
      delete: false,
    },
  },
  viewer: {
    library: { create: false, read: true, update: false, delete: false },
    participants: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: true, update: false, delete: false },
  },
} as const satisfies RolesWithPermissions;

export type AbacProps<Resource extends keyof Permissions> = {
  user: PermissionUser;
  resource: Resource;
  action: Permissions[Resource]["action"];
  data?: Permissions[Resource]["dataType"];
};

export function hasPermission<Resource extends keyof Permissions>({
  user,
  resource,
  action,
  data,
}: AbacProps<Resource>) {
  const role = user.publicMetadata.role as Role;
  const permission = (ROLE_PERMISSIONS as RolesWithPermissions)[role][
    resource
  ]?.[action];
  if (permission == null) return false;
  if (typeof permission === "boolean") return permission;
  return data != null && permission(user, data);
}
