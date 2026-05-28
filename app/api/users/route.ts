import { clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // const { searchParams } = new URL(request.url);
  // const id = searchParams.get("id");

  try {
    // Create the user in Clerk
    const client = await clerkClient();
    const users = await client.users.getUserList({
      // limit: 10,
      orderBy: "-created_at",
    });

    return NextResponse.json(users.data);
  } catch (error: any) {
    // Captures Clerk API errors (e.g., email already exists)
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching users." },
      { status: error.status || 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Helper function to generate a secure random password
  function generateTemporaryPassword(length = 16): string {
    return crypto.randomBytes(length).toString("base64").slice(0, length);
  }

  try {
    const { firstName, lastName, email } = await request.json();

    if (!firstName || !lastName || !email)
      return NextResponse.json(
        { error: "Missing user credentials." },
        { status: 400 },
      );

    const password = generateTemporaryPassword(8);
    // Create the user in Clerk
    const client = await clerkClient();
    const user = await client.users
      .createUser({
        firstName,
        lastName,
        emailAddress: [email],
        password,
        skipPasswordChecks: true,
        // Marks email as verified immediately
        // Required when bypassing password strength rules
      })
      .then(() => {
        // TODO: Send an email to the user with login information.
      });

    return NextResponse.json({ user });
  } catch (error: any) {
    // Captures Clerk API errors (e.g., email already exists)
    return NextResponse.json(
      { error: error.message || "An error occurred while creating the user." },
      { status: error.status || 500 },
    );
  }
}
