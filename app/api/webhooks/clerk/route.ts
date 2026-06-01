import { createClerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { Webhook } from "svix";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "Please add a webhook secret from the Clerk Dashboard to your .env or .env.local file.",
    );
  }

  // Get headers for validation
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", { status: 400 });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const webhook = new Webhook(webhookSecret);
  let webhookEvent: WebhookEvent;

  // Verify the payload
  try {
    webhookEvent = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", { status: 400 });
  }

  // Handle user creation
  if (webhookEvent.type === "user.created") {
    const { id, public_metadata } = webhookEvent.data;
    const firstName = (public_metadata?.firstName as string) || undefined;
    const lastName = (public_metadata?.lastName as string) || undefined;

    const keysToRemove = ["firstName", "lastName"];
    const filteredMetadata = Object.fromEntries(
      Object.entries(public_metadata).filter(
        ([key]) => !keysToRemove.includes(key),
      ),
    );

    // Patch name fields onto the top-level user fields, and remove them from the public metadata.
    if (firstName || lastName) {
      await clerkClient.users.updateUser(id, {
        firstName,
        lastName,
        publicMetadata: filteredMetadata,
      });
    }
  }

  return new Response("", { status: 200 });
}
