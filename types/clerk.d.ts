import { Role } from "../lib/auth";
import { Site } from "./cred";

export {};

declare global {
  interface UserPublicMetadata {
    role?: Role;
    sites?: Site[];
  }
}
