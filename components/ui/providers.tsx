import AdminContextProvider from "@/contexts/admin-context";
import { ClerkProvider } from "@clerk/nextjs";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
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
        <NuqsAdapter>
          <main>{children}</main>
        </NuqsAdapter>
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
        <div className="w-full px-10 pt-5 pb-10 overflow-x-hidden">
          <SidebarTrigger />
          {children}
        </div>
      </SidebarProvider>
    </AdminContextProvider>
  );
}
