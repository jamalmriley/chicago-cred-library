import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { BookScannerProps } from "@/components/BookScanner";

const DynamicBookScanner = dynamic(() => import("@/components/BookScanner"), {
  ssr: false,
  loading: () => (
    <Skeleton className="w-full min-w-96 aspect-video border rounded-xl" />
  ),
}) as <T>(props: BookScannerProps<T>) => React.ReactNode;

export function BookScannerWrapper<T>(props: BookScannerProps<T>) {
  return <DynamicBookScanner {...props} />;
}
