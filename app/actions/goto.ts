"use server";

import { cookies } from "next/headers";

export async function getValidGoToToken(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("goto_access_token")?.value;
  const expiresAt = cookieStore.get("goto_expires_at")?.value;
  const bufferTime = 60 * 1000;

  if (accessToken && expiresAt && Date.now() + bufferTime < Number(expiresAt)) {
    return accessToken;
  }

  // Delegate refresh to the route handler
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/goto/refresh`,
    { method: "POST" },
  );

  if (!res.ok) throw new Error("GOTO_AUTH_REQUIRED");

  // Re-read the refreshed cookie
  const refreshed = cookieStore.get("goto_access_token")?.value;
  if (!refreshed) throw new Error("GOTO_AUTH_REQUIRED");

  return refreshed;
}
