import { Role } from "../lib/auth";
import { Site } from "./cred";

export {};

declare global {
  interface UserPublicMetadata {
    firstName?: string; // When users are invited via the admin dashboard
    lastName?: string; // When users are invited via the admin dashboard
    defaultSite: Site | null;
    isTestUser: boolean;
    role: Role;
  }

  interface ClerkError {
    message: string;
    long_message: string;
    code: string;
    meta: unknown;
    clerk_trace_id: string;
  }

  interface ClerkErrorResponse {
    errors: ClerkError[];
    meta: unknown;
    clerk_trace_id: string;
  }
}
