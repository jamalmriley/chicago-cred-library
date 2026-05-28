import { ClerkUser } from "@/types/cred";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Create the user in Clerk
    const client = await clerkClient();
    const users = await client.users.getUserList({
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
  try {
    const user: ClerkUser = await request.json();
    const { firstName, lastName, email, publicMetadata } = user;

    if (!email)
      return NextResponse.json(
        { error: "Missing email to create invitation." },
        { status: 400 },
      );

    // Create the user in Clerk
    const client = await clerkClient();
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: "https://cred-library.vercel.app/sign-up",
      publicMetadata: {
        firstName,
        lastName,
        ...publicMetadata,
      },
    });

    return NextResponse.json({ invitation });
  } catch (error: any) {
    // Captures Clerk API errors (e.g., email already exists)
    return NextResponse.json(
      { error: error.message || "An error occurred while creating the user." },
      { status: error.status || 500 },
    );
  }
}
