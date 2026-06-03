import { KioskItem } from "./library";

export const SITES = [
  {
    id: "ypc",
    name: "Youth Peace Center",
    nickname: "YPC",
    region: "South",
    neighborhood: "Roseland",
  },
  {
    id: "ss_hub_2",
    name: "SS Hub 2",
    nickname: "95th St",
    region: "South",
    neighborhood: "Pullman",
  },
  {
    id: "wc",
    name: "Women's Center",
    nickname: "Women's Center",
    region: "South",
    neighborhood: "Roseland",
  },
  {
    id: "ws_hub_1",
    name: "WS Hub 1",
    nickname: "Iron St",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    id: "ws_hub_2",
    name: "WS Hub 2",
    nickname: "2501",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    id: "ws_hub_3",
    name: "WS Hub 3",
    nickname: "424",
    region: "West",
    neighborhood: "North Lawndale",
  },
  {
    id: "e_and_t",
    name: "Employment & Training",
    nickname: "E&T",
    region: "Chicago",
    neighborhood: "Chicago",
  },
] as const;
export type Site = (typeof SITES)[number];
export type AllSites = typeof SITES;

const groupSitesByRegion = () => {
  const regions = [...new Set(SITES.map((site) => site.region))];
  return regions.map((region) => ({
    name: region,
    sites: SITES.filter((site: Site) => site.region === region),
  }));
};
export const REGIONS = groupSitesByRegion();

export const getSiteById = (id: string | null) => {
  if (!id) return undefined;
  for (const site of SITES) {
    if (site.id === id) return site;
  }
  return undefined;
};

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
