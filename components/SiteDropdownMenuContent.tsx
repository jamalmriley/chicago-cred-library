import { REGIONS, Site } from "@/types/cred";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";

export default function SiteDropdownMenuContent({
  selectedSite,
  setSelectedSite,
}: {
  selectedSite: Site | null;
  setSelectedSite: React.Dispatch<React.SetStateAction<Site | null>>;
}) {
  return (
    <DropdownMenuContent className="w-fit">
      {REGIONS.map((region, i) => (
        <DropdownMenuGroup key={i}>
          {region.name !== "Chicago" && (
            <DropdownMenuLabel>{region.name}</DropdownMenuLabel>
          )}
          {region.sites.map((site, j) => (
            <DropdownMenuCheckboxItem
              key={j}
              className="flex flex-col justify-center items-start gap-0"
              checked={JSON.stringify(site) === JSON.stringify(selectedSite)}
              onCheckedChange={() => setSelectedSite(site)}
            >
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {site.name}
                  </ItemTitle>
                  <ItemDescription>
                    {[
                      site.name === site.nickname ? "" : `${site.nickname}`,
                      site.neighborhood === "Chicago" ? "" : site.neighborhood,
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
  );
}
