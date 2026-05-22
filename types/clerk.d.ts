import { Role } from "../lib/auth";

export {};

declare global {
  interface UserPublicMetadata {
    role?: Role;
    sites?: string[];
  }
}
