import AdminSidebar from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminContextProvider from "@/contexts/admin-context";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminContextProvider>
      <SidebarProvider>
        <AdminSidebar />
        <div className="w-full px-10 pt-5 pb-10">
          <SidebarTrigger />
          {children}
        </div>
      </SidebarProvider>
    </AdminContextProvider>
  );
}
