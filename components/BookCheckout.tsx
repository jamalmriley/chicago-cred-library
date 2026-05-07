"use client";

import KioskCard from "./KioskCard";
import { Separator } from "@/components/ui/separator";
import BookLineItem from "./BookLineItem";
import { useState } from "react";
import { GoogleBooksErrorResponse, GoogleBooksResponse } from "@/types";
import { Button } from "./ui/button";
import { BookScannerWrapper } from "./BookScannerWrapper";
import { CameraOff, LibraryBig, ScanBarcode } from "lucide-react";
import { useSound } from "use-sound";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { toast } from "sonner";

export default function BookCheckout({ name }: { name: string }) {
  const { cart, setCart } = useCheckoutContext();
  const [showScanner, setShowScanner] = useState(false);
  const [playBeep] = useSound("/sounds/beep.m4a", { volume: 0.5 });

  const handleScan = (isbn: string) => {
    playBeep();
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
    )
      .then((res) => res.json())
      .then((data: GoogleBooksResponse) => {
        if (!data.items) {
          toast.error("No book found for that barcode. Try scanning again.", {
            position: "bottom-right",
          });
          return;
        }
        setCart((prev) => (prev ? [...prev, ...data.items] : [...data.items]));
      })
      .catch((err: GoogleBooksErrorResponse) => {
        toast.error(
          err.error.message || "An error occurred while fetching book data.",
          {
            position: "bottom-right",
          },
        );
      });
  };

  return (
    <KioskCard title={`Start scanning, ${name}.`}>
      <div className="w-1/2 h-full flex flex-col gap-3 overflow-y-hidden">
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <BookLineItem key={index} book={item.volumeInfo} />
          ))
        ) : (
          <div className="w-full h-full flex flex-col flex-1 grow justify-center items-center border rounded-xl p-10 bg-muted text-muted-foreground">
            <LibraryBig className="size-20" />
            <p className="text-lg font-medium text-muted-foreground mb-5 select-none">
              No books scanned yet.
            </p>
          </div>
        )}
      </div>
      <Separator orientation="vertical" decorative className="mx-5" />
      <div className="w-1/2 h-full flex flex-col gap-5">
        {showScanner ? (
          <BookScannerWrapper
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-start items-center gap-5">
            <div className="w-full flex flex-col justify-center items-center aspect-video border rounded-xl bg-muted text-muted-foreground overflow-hidden">
              <CameraOff className="size-20" />
            </div>

            <Button onClick={() => setShowScanner(true)}>
              <ScanBarcode />
              Start scanning
            </Button>
          </div>
        )}
      </div>
    </KioskCard>
  );
}
