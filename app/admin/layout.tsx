import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="page-container p-0 flex flex-col md:flex-row w-full flex-1 mx-auto overflow-hidden bg-island-spice-50 dark:bg-primary-foreground h-full">
      <AdminSidebar />
      <div className="flex flex-col flex-1 grow p-10 md:rounded-tl-4xl md:border-l">
        {children}
      </div>
    </div>
  );
}
