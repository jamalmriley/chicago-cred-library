"use client";

import { Separator } from "@/components/ui/separator";
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
import { SITES } from "@/types/cred";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  ChevronRight,
  CircleGauge,
  LibraryBig,
  ScanBarcode,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AppearanceToggle } from "./AppearanceToggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export default function AdminSidebar() {
  const menuItems = [
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
    {
      id: "audit-log",
      label: "Audit log",
      href: "/admin/audit",
      icon: <ScrollText className="sidebar-icon" />,
    },
    {
      id: "settings",
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="sidebar-icon" />,
    },
  ];

  const { isLoaded, isSignedIn } = useUser();
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
            {menuItems.map((item, i) => (
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
        <AppearanceToggle />
        <UserButton
          appearance={{
            elements: {
              // userButtonAvatarBox: "size-full rounded-none",
              // userButtonAvatarImage: "rounded-none",
            },
            options: { shimmer: false },
          }}
          showName
        />
      </SidebarFooter>
    </Sidebar>
  );
}
export const Logo = () => {
  return (
    <a
      href="/admin"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="/logo.svg"
        alt="Chicago CRED"
        width={100}
        height={100}
        className="size-10 invert dark:invert-0"
      />
      <Separator orientation="vertical" decorative />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-secondary text-2xl uppercase whitespace-pre text-foreground"
      >
        The Library
      </motion.span>
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
