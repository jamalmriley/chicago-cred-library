"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
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
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { AppearanceToggle } from "./AppearanceToggle";
import { Separator } from "./ui/separator";

export default function AdminSidebar() {
  const links = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: (
        <CircleGauge className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: (
        <Users className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Library",
      href: "/admin/library",
      icon: (
        <LibraryBig className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Go to kiosk",
      href: "/",
      icon: (
        <ScanBarcode className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Audit log",
      href: "/admin/audit",
      icon: (
        <ScrollText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
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
        <UserButton />
        {user.fullName || "User Full Name"}
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
