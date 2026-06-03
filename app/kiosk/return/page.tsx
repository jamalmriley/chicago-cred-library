import ReturnPage from "@/components/client-pages/ReturnPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <ReturnPage />
    </Suspense>
  );
}
