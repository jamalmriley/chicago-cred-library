"use client";

import { Separator } from "@/components/ui/separator";
import { useKioskContext } from "@/contexts/kiosk-context";
import { fetchGoogleBook } from "@/lib/utils";
import { Participant } from "@/types/cred";
import { LibraryBig } from "lucide-react";
import { useSound } from "use-sound";
import BookLineItem from "./BookLineItem";
import { BookScannerWrapper } from "./BookScannerWrapper";
import KioskCard from "./KioskCard";

export default function BookCheckout({
  participant,
}: {
  participant: Participant;
}) {
  const { cart, setCart, currBook, setCurrBook, setMaxCheckoutStepAllowed } =
    useKioskContext();
  const [playBeep] = useSound("/sounds/beep.m4a", { volume: 0.5 });

  const handleScan = async (isbn: string) => {
    playBeep();
    const book = await fetchGoogleBook(isbn);
    if (!book) return;
    setCart((prev) => (prev ? [...prev, book] : [book]));
    setMaxCheckoutStepAllowed(3);
  };

  const handleLookup = async (isbn: string) => {
    const book = await fetchGoogleBook(isbn);
    if (!book) return;
    setCurrBook(book);
  };

  return (
    <KioskCard flex="row" title={`Start scanning, ${participant.first_name}.`}>
      <div className="w-80 h-full flex flex-col gap-3 overflow-y-hidden">
        {cart.length > 0 ? (
          cart.map((item, index) => <BookLineItem key={index} book={item} />)
        ) : (
          <div className="w-full h-full flex flex-col flex-1 grow justify-center items-center border rounded-xl p-10 bg-muted text-muted-foreground">
            <LibraryBig className="size-20" />
            <p className="text-lg font-medium text-muted-foreground mb-5 select-none">
              No books added yet.
            </p>
          </div>
        )}
      </div>
      <Separator orientation="vertical" decorative className="mx-5" />
      <div className="w-1/2 h-full">
        <BookScannerWrapper
          book={currBook}
          setBook={setCurrBook}
          onLookup={handleLookup}
          onScan={handleScan}
        />
      </div>
    </KioskCard>
  );
}
