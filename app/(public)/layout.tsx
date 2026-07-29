import type { Viewport } from "next";

// This tells Next.js to enforce full-bleed viewport fits on these exact routes
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // Forces the background to cover the top notch and bottom white bars
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
