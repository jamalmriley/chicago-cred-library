import { AdminProviders } from "@/components/ui/providers";
import { createPageTitle } from "@/lib/utils";

export const metadata = createPageTitle("Dashboard");

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminProviders>{children}</AdminProviders>;
}
