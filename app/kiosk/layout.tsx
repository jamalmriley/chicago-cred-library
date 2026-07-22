import KioskContextProvider from "@/contexts/kiosk-context";
import { createPageTitle } from "@/lib/utils";
import { cookies } from "next/headers";

export async function getValidGoToToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("goto_access_token")?.value;
  const expiresAt = cookieStore.get("goto_expires_at")?.value;

  const bufferTime = 60 * 1000; // Refresh token 1 minute before real expiration

  // Return token directly if it is still alive and healthy
  if (accessToken && expiresAt && Date.now() + bufferTime < Number(expiresAt)) {
    return accessToken;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/goto/refresh`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error("GOTO_AUTH_REQUIRED");

  // Re-read the cookie that the route just wrote
  const refreshToken = cookieStore.get("goto_refresh_token")?.value;
  if (!refreshToken) throw new Error("GOTO_AUTH_REQUIRED");

  return refreshToken;
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
