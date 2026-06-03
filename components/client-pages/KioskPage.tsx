"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { getSiteById, REGIONS } from "@/types/cred";
import { ChevronDown, LibraryBig, MapPin, ScanBarcode } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";

export default function KioskPage() {
  const [site, setSite] = useQueryState("site");
  const siteInfo = getSiteById(site);

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center gap-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge asChild>
            <Button>
              <MapPin />
              {siteInfo
                ? `${siteInfo.name} | ${siteInfo.neighborhood}`
                : "Select a site"}
              <ChevronDown />
            </Button>
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit">
          {REGIONS.map((region, i) => (
            <DropdownMenuGroup key={i}>
              {region.name !== "Chicago" && (
                <DropdownMenuLabel>{region.name}</DropdownMenuLabel>
              )}
              {region.sites.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s.id}
                  className="flex flex-col justify-center items-start gap-0"
                  checked={s.id === site}
                  onCheckedChange={() => setSite(s.id)}
                >
                  <Item size="xs" className="p-0">
                    <ItemContent>
                      <ItemTitle className="whitespace-nowrap">
                        {s.name}
                      </ItemTitle>
                      <ItemDescription>
                        {[
                          s.name === s.nickname ? "" : `${s.nickname}`,
                          s.neighborhood === "Chicago" ? "" : s.neighborhood,
                        ]
                          .filter((el) => el !== "")
                          .join(" | ")}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </DropdownMenuCheckboxItem>
              ))}
              {i < REGIONS.length - 1 && <DropdownMenuSeparator />}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <h1 className="h1 text-center">
        Welcome to the <br />
        CRED Library.
      </h1>
      <h2 className="h2">What would you like to do today?</h2>
      <div className="flex gap-10">
        <Button asChild={Boolean(siteInfo)} disabled={Boolean(!siteInfo)}>
          <Link
            href={`/kiosk/checkout${siteInfo ? `?site=${siteInfo.id}` : ""}`}
            className="flex gap-2 items-center"
          >
            <ScanBarcode />
            Check out a book
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild={Boolean(siteInfo)}
          disabled={Boolean(!siteInfo)}
        >
          <Link
            href={`/kiosk/return${siteInfo ? `?site=${siteInfo.id}` : ""}`}
            className="flex gap-2 items-center"
          >
            <LibraryBig />
            Return a book
          </Link>
        </Button>
      </div>
    </div>
  );
}
