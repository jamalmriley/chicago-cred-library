import { Button } from "@/components/ui/button";
import { Highlighter } from "@/components/ui/highlighter";
import BackgroundImage from "@/public/images/ed-image-3.png";
import Logo from "@/public/images/logo.svg";
import { auth } from "@clerk/nextjs/server";
import { Code, LogIn, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  const isLoggedIn = Boolean(userId);

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src={BackgroundImage}
        alt="Background"
        fill
        priority
        className="object-cover -z-20" // Placed at the very bottom
      />

      {/* Tint Overlay */}
      <div className="absolute inset-0 bg-[#0a0a0a]/75 -z-10" />

      {/* Foreground Content */}
      <div className="text-white z-10 p-10 max-w-5xl">
        <Image
          src={Logo}
          alt="Chicago CRED Logo"
          width={100}
          height={100}
          className="h-24 w-auto aspect-auto mx-auto shrink-0" // Placed at the very bottom
        />

        <h1 className="text-9xl text-center font-secondary uppercase">
          #<span className="text-primary">CRED</span>
          UCATION
        </h1>
        <h2 className="h2 text-center">Welcome to the CRED Library.</h2>
        <p>
          <Highlighter action="highlight" color="#ae4107">
            Project L.I.B.R.A.R.Y.
          </Highlighter>{" "}
          (Literacy Interface for Boosting Reading Access and Resources
          Year-round) is an internal technical tool that was created to aid
          Chicago CRED's literacy initiative — a mission to{" "}
          <Highlighter action="box" color="#ae4107">
            expand literacy access and resources
          </Highlighter>{" "}
          for our participants{" "}
          <Highlighter action="underline" color="#ae4107">
            and
          </Highlighter>{" "}
          their families.
        </p>
        <br />
        <p>
          Without a system to manage users, inventory, and their interactions,
          it's impossible to properly track books or measure reading engagement.
          That's where this project comes in.
        </p>
        <br />
        <div className="w-full flex justify-center gap-5">
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
          <Button variant="outline" asChild className="molde-button">
            <Link href="https://github.com/jamalmriley/project-library">
              <Code />
              View project
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
