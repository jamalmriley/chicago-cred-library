"use client";

import { useSites } from "@/hooks/use-sites";
import { getSiteById, Site } from "@/types/cred";
import { useUser } from "@clerk/nextjs";
import { DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function SiteSelect({
  isDisabled = false,
  selectedSite,
  setSelectedSite,
}: {
  isDisabled?: boolean;
  selectedSite: Site | null;
  setSelectedSite: React.Dispatch<React.SetStateAction<Site | null>>;
}) {
  const { regions, sites } = useSites();
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn || !regions || !sites || !user) return;
  return (
    <Select
      value={selectedSite?.id}
      onValueChange={(value) => setSelectedSite(getSiteById(value, sites))}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Select a site">
          {selectedSite?.nickname}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-fit">
        {regions.map((region, i) => (
          <SelectGroup key={i}>
            {region.name !== "Chicago" && (
              <SelectLabel>{region.name}</SelectLabel>
            )}
            {region.sites.map((site, j) => (
              <SelectItem
                key={j}
                className="flex flex-col justify-center items-start gap-0"
                value={site.id}
              >
                <Item size="xs" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {site.name}
                    </ItemTitle>
                    <ItemDescription>
                      {[
                        site.name === site.nickname ? "" : `${site.nickname}`,
                        site.neighborhood === "Chicago"
                          ? ""
                          : site.neighborhood,
                      ]
                        .filter((el) => el !== "")
                        .join(" | ")}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </SelectItem>
            ))}
            {i < regions.length - 1 && <DropdownMenuSeparator />}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
