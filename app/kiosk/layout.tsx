import KioskContextProvider from "@/contexts/kiosk-context";
import { createPageTitle } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = createPageTitle("Kiosk");
export default async function KioskLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("goto_access_token")?.value;
  const refreshToken = cookieStore.get("goto_refresh_token")?.value;

  // If no tokens at all, redirect to GoTo auth before allowing kiosk access.
  if (!accessToken && !refreshToken) {
    redirect("/api/goto?origin=kiosk");
  }

  // If access token expired but refresh token exists, warm it up silently.
  if (!accessToken && refreshToken) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/goto/refresh`, {
        method: "POST",
      });
    } catch {
      // Silent fail since sendGotoSms will handle the toast on checkout.
    }
  }
  return <KioskContextProvider>{children}</KioskContextProvider>;
}
