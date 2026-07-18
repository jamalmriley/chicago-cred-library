import KioskContextProvider from "@/contexts/kiosk-context";
import { getValidGoToToken } from "@/lib/goto";
import { createPageTitle } from "@/lib/utils";

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
