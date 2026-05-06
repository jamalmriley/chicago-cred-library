import dynamic from "next/dynamic";

export const BookScannerWrapper = dynamic(
  () => import("@/components/BookScanner"),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted-foreground">Loading camera...</p>
    ),
  },
);
