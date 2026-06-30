import SignUpPage from "@/components/client-pages/SignUpPage";
import SignUpContextProvider from "@/contexts/sign-up-context";
import BackgroundImage from "@/public/images/ed-image-1.png";
import Image from "next/image";

export default function Page() {
  return (
    <SignUpContextProvider>
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src={BackgroundImage}
          alt="Background"
          fill
          priority
          className="object-cover -z-20" // Placed at the very bottom
        />

        {/* Tint Overlay */}
        <div className="absolute inset-0 bg-[#0a0a0a]/75 -z-10" />

        {/* Foreground Content */}
        <div className="z-10 p-10">
          <SignUpPage />
        </div>
      </div>
    </SignUpContextProvider>
  );
}
