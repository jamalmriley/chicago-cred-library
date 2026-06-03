import CheckoutPage from "@/components/client-pages/CheckoutPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <CheckoutPage />
    </Suspense>
  );
}
