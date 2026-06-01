import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { cn, createPageTitle } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/ui/providers";

const primaryFont = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
});

const secondaryFont = localFont({
  src: "../fonts/molde-condensed-bold.ttf",
  display: "swap",
  variable: "--font-secondary",
});

export const metadata = createPageTitle();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        primaryFont.variable,
        secondaryFont.variable,
      )}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
