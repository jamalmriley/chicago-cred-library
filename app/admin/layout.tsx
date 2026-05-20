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
      <div className="w-[calc(100dvw-16rem)] px-10 pt-5 pb-10 border-l rounded-tl-4xl">
        <SidebarTrigger />
        {children}
      </div>
    </SidebarProvider>
  );
}
