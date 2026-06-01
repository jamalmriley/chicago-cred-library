import KioskContextProvider from "@/contexts/kiosk-context";
import { createPageTitle } from "@/lib/utils";

export const metadata = createPageTitle("Kiosk");
export default function KioskLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <KioskContextProvider>{children}</KioskContextProvider>;
}
