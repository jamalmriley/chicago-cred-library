import { Weekday } from "./data";
import { CheckoutItem } from "./library";

export interface Site {
  id: string;
  order: number;
  name: string;
  nickname: string;
  salesforce_names: string[];
  region: string;
  neighborhood: string;
  created_at: Date;
  updated_at: Date;
  settings: SiteSettings | null;
}

export interface GoToConnection {
  sender_id: string; // Clerk user ID
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  phone: string | null; // ← the sender's GoTo number in E.164 e.g. "+13125550100"
}

export const RETURN_DURATION_OPTS = [
  "1 week",
  "2 weeks",
  "3 weeks",
  "1 month",
] as const;
export type DurationOption = (typeof RETURN_DURATION_OPTS)[number];

export const OVERDUE_PENALTY_OPTS = [
  "Book report",
  "Community service",
  "Site tasks",
  "Stipend deduction",
] as const;
export type PenaltyOption = (typeof OVERDUE_PENALTY_OPTS)[number];

export interface SiteSettings {
  // General settings
  email_notification_recipients: string[] | undefined;
  // Checkout settings
  book_checkout_limit: number | "Unlimited" | undefined;
  kiosk_checkout_limit: number | "Unlimited" | undefined;
  is_limits_synced: boolean | undefined;
  // Return settings
  return_window: DurationOption | undefined;
  return_extension: DurationOption | undefined;
  return_extension_limit: number | "Unlimited" | undefined;
  overdue_penalty: PenaltyOption | undefined;
}

export interface Region {
  name: string;
  sites: Site[];
}

export const groupSitesByRegion = (sites: Site[] | null): Region[] => {
  if (!sites) return [];
  const regions = [...new Set(sites.map((site) => site.region))];
  return regions.map((region) => ({
    name: region,
    sites: sites
      .filter((site: Site) => site.region === region)
      .sort((a, b) => a.order - b.order),
  }));
};

export const getSiteById = (id: string | null, sites: Site[] | null) => {
  if (!id || id === "" || !sites) return null;
  for (const site of sites) {
    if (site.id === id) return site;
  }
  return null;
};

export const getSiteBySalesforceName = (
  name: string | null,
  sites: Site[] | null,
) => {
  if (!name || name === "" || !sites) return null;
  for (const site of sites) {
    if (site.salesforce_names.includes(name)) return site;
  }
  return null;
};

export interface ClerkUser {
  id: string | null;
  firstName: string;
  lastName: string;
  email: string;
  publicMetadata: UserPublicMetadata;
}

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  email: string;
  phone: string;
  siteId: string;
  programDays: Weekday[];
  group: "Morning" | "Afternoon" | "All Day";
  checkout_history?: CheckoutItem[] | null;
}

export type UserType = "Participant" | "Staff";
