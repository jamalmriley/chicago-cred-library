import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

export const BookScannerWrapper = dynamic(
  () => import("@/components/BookScanner"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full aspect-video border rounded-xl" />
    ),
  },
);
