import { Role } from "@/lib/auth";
import { KioskItem } from "./library";

export const SITES = [
  {
    name: "Youth Peace Center",
    value: "YPC",
    region: "South",
    neighborhood: "Roseland",
  },
  {
    name: "SS Hub 2",
    value: "95th St",
    region: "South",
    neighborhood: "Pullman",
  },
  {
    name: "Women's Center",
    value: "Women's Center",
    region: "South",
    neighborhood: "Roseland",
  },
  {
    name: "WS Hub 1",
    value: "Iron St",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    name: "WS Hub 2",
    value: "2501",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    name: "WS Hub 3",
    value: "424",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    name: "Employment & Training",
    value: "E&T",
    region: "Chicago",
    neighborhood: "Chicago",
  },
] as const;
export type Site = (typeof SITES)[number];
export type AllSites = typeof SITES;

export interface Participant {
  id: string;
  created_at: Date;
  first_name: string;
  last_name: string;
  birthday: string;
  email: string;
  site: Site;
  reading_level: string;
  notes: string | null;
  checkout_history: KioskItem[] | null;
  updated_at: Date;
}

export interface CredMetadata {
  defaultSite: Site | null;
  role: Role;
  sites: Site[];
}
