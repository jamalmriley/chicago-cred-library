import { Providers } from "@/components/ui/providers";
import { cn, createPageTitle } from "@/lib/utils";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
