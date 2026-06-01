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
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import {
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
import { AppearanceToggle } from "./AppearanceToggle";
import { Separator } from "@/components/ui/separator";

export default function AdminSidebar() {
  const links = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <CircleGauge className="sidebar-icon" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users className="sidebar-icon" />,
    },
    {
      label: "Library",
      href: "/admin/library",
      icon: <LibraryBig className="sidebar-icon" />,
    },
    {
      label: "Go to kiosk",
      href: "/kiosk",
      icon: <ScanBarcode className="sidebar-icon" />,
    },
    {
      label: "Audit log",
      href: "/admin/audit",
      icon: <ScrollText className="sidebar-icon" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="sidebar-icon" />,
    },
  ];

  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) return null; // TODO: Return a skeleton sidebar.
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {links.map((link, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton asChild>
                  <Link href={link.href}>
                    {link.icon}
                    {link.label}
                  </Link>
                </SidebarMenuButton>
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
