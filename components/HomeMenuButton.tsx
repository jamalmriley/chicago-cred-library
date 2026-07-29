"use client";

import { useUser } from "@clerk/nextjs";
import { Code, LogIn, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";

export default function HomeMenuButton() {
  const { user } = useUser();

  const isLoggedIn = Boolean(user?.id);
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          // onClick={() => setIsOpen((prev) => !prev)}
          className="z-50 md:hidden absolute top-5 right-5 focus:outline-none"
        >
          <Menu />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col p-2 gap-2">
        <Button asChild className="molde-button">
          <Link href={isLoggedIn ? "/admin" : "/sign-in"}>
            <LogIn />
            {isLoggedIn ? "Dashboard" : "Log in"}
          </Link>
        </Button>
        {!isLoggedIn && (
          <Button variant="secondary" asChild className="molde-button">
            <Link href="/sign-up">
              <Plus />
              Create account
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="molde-button">
          <Link href="https://github.com/jamalmriley/chicago-cred-library">
            <Code />
            View project
          </Link>
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
