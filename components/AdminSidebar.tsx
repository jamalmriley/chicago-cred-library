"use client";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  CircleGauge,
  LibraryBig,
  ScanBarcode,
  ScrollText,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          {/* TODO: Link to Clerk */}
          <SidebarLink
            link={{
              label: "Jamal Riley",
              href: "#",
              icon: (
                <img
                  src="/example_profile_picture.png"
                  className="h-7 w-7 shrink-0 rounded-full"
                  width={50}
                  height={50}
                  alt="Jamal Riley"
                />
              ),
            }}
          />
        </div>
      </SidebarBody>
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
        alt="ChicagoCRED"
        width={100}
        height={100}
        className="size-10 invert dark:invert-0"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        CRED Library
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
