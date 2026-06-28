import { hasPermission } from "@/lib/auth";
import { ClerkUser } from "@/types/cred";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
      { error: error.message || "An error occurred while inviting the user." },
      { status: error.status || 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const client = await clerkClient();

    if (id) {
      const user = await client.users.getUser(id);
      return NextResponse.json(user);
    }

    const users = await client.users.getUserList({ orderBy: "-created_at" });
    return NextResponse.json(users.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "An error occurred while gathering user info.",
      },
      { status: error.status || 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    const targetUserId = id ?? currentUserId;

    if (!targetUserId || !currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(currentUserId);

    const isSelfUpdate = targetUserId === currentUserId;

    if (!isSelfUpdate) {
      if (
        !hasPermission({
          user: currentUser,
          action: "update",
          resource: "users",
        })
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    const isClerkUser = "id" in body;

    if (isClerkUser) {
      // Update user
      const { firstName, lastName, publicMetadata } = body;
      const user = await client.users.updateUser(targetUserId, {
        firstName,
        lastName,
        publicMetadata,
      });
      return NextResponse.json(user);
    } else {
      // Update metadata only
      const publicMetadata = body;
      const user = await client.users.replaceUserMetadata(targetUserId, {
        publicMetadata,
      });
      return NextResponse.json(user);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred while updating the user." },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Missing user ID." }, { status: 400 });

    const client = await clerkClient();
    await client.users.deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred while deleting the user." },
      { status: error.status || 500 },
    );
  }
}
