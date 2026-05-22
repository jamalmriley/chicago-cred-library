import KioskContextProvider from "@/contexts/kiosk-context";

export default function KioskLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <KioskContextProvider>{children}</KioskContextProvider>;
}
