import KioskContextProvider from "@/contexts/kiosk-context";
import { createPageTitle } from "@/lib/utils";
import { cookies } from "next/headers";

export async function getValidGoToToken(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("goto_access_token")?.value;
  const expiresAt = cookieStore.get("goto_expires_at")?.value;
  const refreshToken = cookieStore.get("goto_refresh_token")?.value;

  const bufferTime = 60 * 1000; // Refresh token 1 minute before real expiration

  // Return token directly if it is still alive and healthy
  if (accessToken && expiresAt && Date.now() + bufferTime < Number(expiresAt)) {
    return accessToken;
  }

  if (!refreshToken) throw new Error("GOTO_AUTH_REQUIRED");

  // The token is missing or dead; trigger a silent refresh.
  const response = await fetch(
    "https://authentication.logmeininc.com/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.GOTO_CLIENT_ID!,
        client_secret: process.env.GOTO_CLIENT_SECRET!,
      }),
    },
  );

  if (!response.ok) throw new Error("GOTO_AUTH_REQUIRED");

  const newTokens = await response.json();
  const nextExpiresAt = Date.now() + newTokens.expires_in * 1000;
  const isProduction = process.env.NODE_ENV === "production";

  // Re-save rotated updates
  cookieStore.set("goto_access_token", newTokens.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: newTokens.expires_in,
  });
  cookieStore.set("goto_expires_at", nextExpiresAt.toString(), {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  });

  if (newTokens.refresh_token) {
    cookieStore.set("goto_refresh_token", newTokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return newTokens.access_token;
}

export const metadata = createPageTitle("Kiosk");
export default async function KioskLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await getValidGoToToken(); // Warm up token silently before checkout/return
  } catch {
    // The token missing or broken, but the kiosk will still load.
    // The SMS will show toast on failure.
  }
  return <KioskContextProvider>{children}</KioskContextProvider>;
}
