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
import { useSites } from "@/hooks/use-sites";
import { getSiteById } from "@/types/cred";
import { Building, ChevronDown, LibraryBig, ScanBarcode } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import Marquee3D from "../BookMarquee";
import { useEffect, useState } from "react";
import { LibraryBook } from "@/types/library";

export default function KioskPage() {
  const { regions, sites } = useSites();
  const [site, setSite] = useQueryState("site");
  const [books, setBooks] = useState<LibraryBook[] | null>(null);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const siteInfo = sites ? getSiteById(site, sites) : null;

  useEffect(() => {
    const fetchBooks = async () => {
      await setBooksLoading(true);
      const res = await fetch("/api/library");

      if (!res.ok) {
        setBooksLoading(false);
        setBooks(null);
        // console.error(await res.json());
        return;
      }

      const data: LibraryBook[] = await res.json();
      setBooksLoading(false);
      setBooks(data);
    };

    fetchBooks();
  }, []);

  if (!books || booksLoading) return;
  return (
    <div className="relative min-h-dvh flex flex-col justify-center items-center gap-5 overflow-hidden">
      {/* Background marquee */}
      <div className="absolute inset-0 opacity-20">
        <Marquee3D books={books} />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col justify-center items-center gap-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge asChild>
              <Button>
                <Building />
                {siteInfo ? siteInfo.name : "Select a site"}
                <ChevronDown />
              </Button>
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit">
            {regions.map((region, i) => (
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
                {i < regions.length - 1 && <DropdownMenuSeparator />}
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
          <Button
            asChild={Boolean(siteInfo)}
            className="molde-button"
            disabled={Boolean(!siteInfo)}
          >
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
            className="molde-button"
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
    </div>
  );
}
