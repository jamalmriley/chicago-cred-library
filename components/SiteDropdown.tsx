"use client";

import { useSites } from "@/hooks/use-sites";
import { Site } from "@/types/cred";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Spinner } from "./ui/spinner";

export default function SiteDropdown({
  isDisabled,
  selectedSite,
  setSelectedSite,
}: {
  isDisabled?: boolean;
  selectedSite: Site | null;
  setSelectedSite: React.Dispatch<React.SetStateAction<Site | null>>;
}) {
  const { regions, sites } = useSites();
  if (!regions || !sites)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled>
          <Button size="icon" className="rounded-l-none border-l-0">
            <Spinner data-icon="inline-start" />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isDisabled}>
        <Button size="icon" className="rounded-l-none border-l-0">
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit">
        {regions.map((region, i) => (
          <DropdownMenuGroup key={i}>
            {region.name !== "Chicago" && (
              <DropdownMenuLabel>{region.name}</DropdownMenuLabel>
            )}
            {region.sites.map((site, j) => (
              <DropdownMenuItem
                key={j}
                className={`flex flex-col justify-center items-start gap-0 ${selectedSite && selectedSite.id === site.id ? "border border-primary bg-primary/20" : ""}`}
                onClick={() => setSelectedSite(site)}
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
              </DropdownMenuItem>
            ))}
            {i < regions.length - 1 && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
