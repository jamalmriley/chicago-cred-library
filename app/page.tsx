import { Button } from "@/components/ui/button";
import { Code, Info, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BackgroundImage from "@/public/images/ed-image-3.png";
import Logo from "@/public/images/logo.svg";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();
  const isLoggedIn = Boolean(userId);

  return (
    // 1. Container with explicit height and relative positioning
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* 2. Next.js Optimized Background Image */}
      <Image
        src={BackgroundImage}
        alt="Background"
        fill
        priority
        className="object-cover -z-20" // Placed at the very bottom
      />

      {/* 3. Black Overlay Div (Change /50 to adjust opacity, e.g., /70) */}
      <div className="absolute inset-0 bg-background/75 -z-10" />

      {/* 4. Foreground Content */}
      <div className="text-foreground z-10 p-10 max-w-5xl">
        <Image
          src={Logo}
          alt="Chicago CRED Logo"
          width={100}
          height={100}
          className="h-24 w-auto aspect-auto mx-auto shrink-0 invert dark:invert-0" // Placed at the very bottom
        />

        <h1 className="text-9xl text-center font-secondary uppercase">
          #<span className="text-primary">CRED</span>
          UCATION
        </h1>
        <h2 className="h2 text-center">Welcome to the CRED Library.</h2>
        <p>
          <span>
            <Link
              href="https://github.com/jamalmriley/project-library"
              className="hover:text-primary hover:underline"
            >
              Project L.I.B.R.A.R.Y.
            </Link>
          </span>{" "}
          (Literacy Interface for Boosting Reading Access and Resources
          Year-round) is an internal technical tool that was created to aid
          Chicago CRED's literacy initiative — a mission to increase expand
          literacy access and resources for our participants.
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
          <Button variant="secondary" asChild className="molde-button">
            <Link href="https://github.com/jamalmriley/project-library">
              <Code />
              View project
            </Link>
          </Button>
          <Button variant="outline" asChild className="molde-button">
            <Link href="https://www.chicagocred.org/">
              <Info />
              Chicago CRED
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
