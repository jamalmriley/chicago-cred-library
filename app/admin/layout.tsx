import AdminSidebar from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="px-10 pt-5 pb-10">
        <SidebarTrigger />
        {children}
      </div>
    </SidebarProvider>
  );
}
