import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";

export const BookScannerWrapper = dynamic(
  () => import("@/components/BookScanner"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full aspect-video border rounded-xl" />
    ),
  },
);
