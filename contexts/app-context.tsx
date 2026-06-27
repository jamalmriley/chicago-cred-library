"use client";

import { groupSitesByRegion, Region, Site } from "@/types/cred";
import { createContext, useContext, useEffect, useState } from "react";

type AppContext = {
  lastUpdated: string;
  setLastUpdated: React.Dispatch<React.SetStateAction<string>>;
  // Sites
  regions: Region[];
  sites: Site[] | null;
  setSites: React.Dispatch<React.SetStateAction<Site[] | null>>;
  sitesError: string | null;
  setSitesError: React.Dispatch<React.SetStateAction<string | null>>;
  sitesLoading: boolean;
  setSitesLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // Time
  today: Date;
  setToday: React.Dispatch<React.SetStateAction<Date>>;
  oneWeekFromToday: Date;
  twoWeeksFromToday: Date;
  threeWeeksFromToday: Date;
  oneMonthFromToday: Date;
};

export const AppContext = createContext<AppContext | null>(null);

export default function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  // Sites
  const [sites, setSites] = useState<Site[] | null>(null);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [sitesLoading, setSitesLoading] = useState<boolean>(true);
  // Time
  const [today, setToday] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      // d.setHours(0, 0, 0, 0);
      setToday(d);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const regions = groupSitesByRegion(sites).sort((a, b) => {
    const minOrderA = Math.min(...a.sites.map((site) => site.order));
    const minOrderB = Math.min(...b.sites.map((site) => site.order));

    return minOrderA - minOrderB;
  });

  const oneWeekFromToday = new Date(today);
  oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
  oneWeekFromToday.setHours(23, 59, 0, 0);

  const twoWeeksFromToday = new Date(today);
  twoWeeksFromToday.setDate(twoWeeksFromToday.getDate() + 14);
  twoWeeksFromToday.setHours(23, 59, 0, 0);

  const threeWeeksFromToday = new Date(today);
  threeWeeksFromToday.setDate(threeWeeksFromToday.getDate() + 21);
  threeWeeksFromToday.setHours(23, 59, 0, 0);

  const oneMonthFromToday = new Date(today);
  oneMonthFromToday.setDate(oneMonthFromToday.getMonth() + 1);
  oneMonthFromToday.setHours(23, 59, 0, 0);

  return (
    <AppContext.Provider
      value={{
        lastUpdated,
        setLastUpdated,
        regions,
        sites,
        setSites,
        sitesError,
        setSitesError,
        sitesLoading,
        setSitesLoading,
        today,
        setToday,
        oneWeekFromToday,
        twoWeeksFromToday,
        threeWeeksFromToday,
        oneMonthFromToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppContextProvider.");
  }
  return context;
}
