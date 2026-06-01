import AdminContextProvider from "@/contexts/admin-context";
import { ClerkProvider } from "@clerk/nextjs";
import AdminSidebar from "../AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "./sidebar";
import { Toaster } from "./sonner";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex flex-col min-h-dvh">
          <main className="page-wrapper">{children}</main>
        </div>
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <AdminContextProvider>
      <SidebarProvider>
        <AdminSidebar />
        <div className="w-full">
          <SidebarTrigger />
          {children}
        </div>
      </SidebarProvider>
    </AdminContextProvider>
  );
}
