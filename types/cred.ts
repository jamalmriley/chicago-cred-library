import { Role } from "@/lib/auth";
import { KioskItem } from "./library";

const sites = [
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
export type Site = (typeof sites)[number];
export type AllSites = typeof sites;

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
