import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

export const BookScannerWrapper = dynamic(
  () => import("@/components/BookScanner"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full min-w-96 aspect-video border rounded-xl" />
    ),
  },
);
