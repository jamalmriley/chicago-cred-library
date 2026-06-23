"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { capitalizeString } from "@/lib/utils";
import { SITES } from "@/types/cred";
import { SignOutButton, UserAvatar, useUser } from "@clerk/nextjs";
import {
  ChevronRight,
  ChevronsUpDown,
  CircleGauge,
  LibraryBig,
  LogOut,
  Moon,
  ScanBarcode,
  Settings,
  Sun,
  SunMoon,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function AdminSidebar() {
  const contentMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin",
      icon: <CircleGauge className="sidebar-icon" />,
    },
    {
      id: "users",
      label: "Users",
      href: "/admin/users",
      icon: <Users className="sidebar-icon" />,
    },
    {
      id: "library",
      label: "Library",
      href: "/admin/library",
      icon: <LibraryBig className="sidebar-icon" />,
    },
    {
      id: "kiosk",
      label: "Go to kiosk",
      href: "/kiosk",
      icon: <ScanBarcode className="sidebar-icon" />,
    },
    // {
    //   id: "audit-log",
    //   label: "Audit log",
    //   href: "/admin/audit",
    //   icon: <ScrollText className="sidebar-icon" />,
    // },
    {
      id: "settings",
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="sidebar-icon" />,
    },
  ];

  const { theme, setTheme } = useTheme();
  const { isLoaded, isSignedIn, user } = useUser();
  const [open, setOpen] = useState(false);

  if (!isLoaded || !isSignedIn) return null; // TODO: Return a skeleton sidebar.
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {contentMenuItems.map((item, i) => (
              <SidebarMenuItem key={i}>
                {item.id === "kiosk" ? (
                  <Collapsible open={open} onOpenChange={setOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full">
                        {item.icon}
                        {item.label}
                        <ChevronRight
                          className={`ml-auto transition-all ease-in-out duration-200 ${open ? "rotate-90" : "rotate-0"}`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {SITES.map((site) => (
                          <SidebarMenuSubItem key={site.id}>
                            <SidebarMenuButton asChild>
                              <Link
                                href={`${item.href}?site=${site.id}`}
                                className="h-fit flex flex-col items-start leading-none"
                              >
                                {site.name}

                                <span className="text-xs text-muted-foreground">
                                  {[
                                    site.name === site.nickname
                                      ? ""
                                      : site.nickname,
                                    site.neighborhood === "Chicago"
                                      ? ""
                                      : site.neighborhood,
                                  ]
                                    .filter((el) => el !== "")
                                    .join(" | ")}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="flex">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="py-3">
                  <UserAvatar /> {user.fullName}
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit">
                <DropdownMenuItem className="flex items-center gap-2">
                  <UserAvatar />
                  <span className="flex flex-col">
                    <p>{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.emailAddresses[0].emailAddress}
                    </p>
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === "light" ? (
                      <Sun />
                    ) : theme === "dark" ? (
                      <Moon />
                    ) : (
                      <SunMoon />
                    )}
                    Theme: {capitalizeString(theme)}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      System
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <SignOutButton>
                  <DropdownMenuItem variant="destructive">
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
export const Logo = () => {
  return (
    <a href="/admin" className="py-3 pl-3">
      <Image
        src="/images/logo.png"
        alt="Chicago CRED"
        width={767}
        height={356}
        className="h-14 w-auto aspect-auto shrink-0 dark:invert select-none"
      />
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="/admin"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="/logo.svg"
        alt="ChicagoCRED"
        width={100}
        height={100}
        className="size-10 invert dark:invert-0"
      />
    </a>
  );
};
