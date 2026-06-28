import SignUpPage from "@/components/client-pages/SignUpPage";
import SignUpContextProvider from "@/contexts/sign-up-context";

export default function Page() {
  return (
    <SignUpContextProvider>
      <SignUpPage />
    </SignUpContextProvider>
  );
}
