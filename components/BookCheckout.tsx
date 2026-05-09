"use client";

import { Separator } from "@/components/ui/separator";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { GoogleBooksErrorResponse, GoogleBooksResponse } from "@/types/books";
import { Participant } from "@/types/user";
import { LibraryBig } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSound } from "use-sound";
import BookLineItem from "./BookLineItem";
import { BookScannerWrapper } from "./BookScannerWrapper";
import KioskCard from "./KioskCard";

export default function BookCheckout({
  participant,
}: {
  participant: Participant;
}) {
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
          toast.error("Book not found. Try scanning again.", {
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
    <KioskCard flex="row" title={`Start scanning, ${participant.first_name}.`}>
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
      <div className="w-1/2 h-full">
        <BookScannerWrapper onScan={handleScan} />
      </div>
    </KioskCard>
  );
}
