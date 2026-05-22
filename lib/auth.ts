import { Participant } from "@/types/cred";
import { GoogleBooks } from "@/types/library";
import { User } from "@clerk/nextjs/server";

export type Role = "super_admin" | "admin" | "staff" | "viewer";

type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: User, data: Permissions[Key]["dataType"]) => boolean);

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
    dataType: User;
    action: "create" | "read" | "update" | "delete";
  };
};

const ROLES = {
  super_admin: {
    library: { create: true, read: true, update: true, delete: true },
    participants: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
  },
  admin: {
    library: { create: true, read: true, update: true, delete: false },
    participants: { create: true, read: true, update: true, delete: false },
    users: { create: true, read: true, update: true, delete: false },
  },
  staff: {
    library: { create: true, read: true, update: true, delete: false },
    participants: { create: true, read: true, update: true, delete: false },
    users: {
      create: false,
      read: true,
      update: (user, data) => user.id === data.id, // Staff can only update their own profile.
      delete: false,
    },
  },
  viewer: {
    library: { create: false, read: true, update: false, delete: false },
    participants: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: true, update: false, delete: false },
  },
} as const satisfies RolesWithPermissions;

export function hasPermission<Resource extends keyof Permissions>(
  user: User,
  action: Permissions[Resource]["action"],
  resource: Resource,
  data?: Permissions[Resource]["dataType"],
) {
  const role = user.publicMetadata.role as Role;
  const permission = (ROLES as RolesWithPermissions)[role][resource]?.[action];
  if (permission == null) return false;
  if (typeof permission === "boolean") return permission;
  return data != null && permission(user, data);
}
