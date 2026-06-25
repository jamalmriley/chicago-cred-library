import { useAppContext } from "@/contexts/app-context";
import { Site } from "@/types/cred";
import { useEffect } from "react";

export function useSites() {
  const {
    lastUpdated,
    regions,
    sites,
    setSites,
    sitesError,
    setSitesError,
    sitesLoading,
    setSitesLoading,
  } = useAppContext();

  useEffect(() => {
    const fetchSites = async () => {
      await setSitesLoading(true);
      const res = await fetch("/api/sites");

      if (!res.ok) {
        setSitesLoading(false);
        setSites(null);
        setSitesError("There was an error loading sites.");
        // console.error(await res.json());
        return;
      }

      const data: Site[] = await res.json();
      setSitesLoading(false);
      setSites(data);
      setSitesError(null);
    };

    fetchSites();
  }, [lastUpdated]);

  return { regions, sites, sitesError, sitesLoading };
}
