import { KioskItem } from "./library";

export const SITES = [
  {
    name: "Youth Peace Center",
    nickname: "YPC",
    region: "South",
    neighborhood: "Roseland",
  },
  {
    name: "SS Hub 2",
    nickname: "95th St",
    region: "South",
    neighborhood: "Pullman",
  },
  {
    name: "Women's Center",
    nickname: "Women's Center",
    region: "South",
    neighborhood: "Roseland",
  },
  {
    name: "WS Hub 1",
    nickname: "Iron St",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    name: "WS Hub 2",
    nickname: "2501",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    name: "WS Hub 3",
    nickname: "424",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    name: "Employment & Training",
    nickname: "E&T",
    region: "Chicago",
    neighborhood: "Chicago",
  },
] as const;
export type Site = (typeof SITES)[number];
export type AllSites = typeof SITES;

export interface ClerkUser {
  firstName: string;
  lastName: string;
  email: string;
  publicMetadata: UserPublicMetadata;
}

export interface Participant {
  id: string;
  created_at: Date;
  first_name: string;
  last_name: string;
  birthday: string;
  email: string;
  site: Site;
  notes: string | null;
  checkout_history: KioskItem[] | null;
  updated_at: Date;
}

export type UserType = "Participant" | "Staff";
