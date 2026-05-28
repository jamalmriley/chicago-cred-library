import { Role } from "../lib/auth";
import { Site } from "./cred";

export {};

declare global {
  interface UserPublicMetadata {
    defaultSite?: Site;
    isTestUser?: boolean;
    role?: Role;
  }
}
