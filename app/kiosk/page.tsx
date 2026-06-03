import KioskPage from "@/components/client-pages/KioskPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <KioskPage />
    </Suspense>
  );
}
