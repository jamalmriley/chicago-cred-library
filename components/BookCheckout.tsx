"use client";

import { Separator } from "@/components/ui/separator";
import { useKioskContext } from "@/contexts/kiosk-context";
import { fetchLibraryBook } from "@/lib/books";
import { Participant } from "@/types/cred";
import { LibraryBook } from "@/types/library";
import { LibraryBig } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useSound } from "use-sound";
import { CheckoutBookLineItem, LookupBookLineItem } from "./BookLineItem";
import { BookScannerWrapper } from "./BookScannerWrapper";
import KioskCard from "./KioskCard";

export default function BookCheckout({
  participant,
}: {
  participant: Participant;
}) {
  const { cart, currBook, setCurrBook } = useKioskContext();
  const [playBeep] = useSound("/sounds/beep.m4a", { volume: 0.5 });
  const [site] = useQueryState("site");
  const [isScanComplete, setIsScanComplete] = useState(false);

  const fetchAndSetBook = async (id: string, openDialog = false) => {
    const book = await fetchLibraryBook(`${site}_${id}`);
    if (!book) return;
    setCurrBook(book);
    setIsScanComplete(openDialog);
  };

  const handleScan = async (id: string) => {
    playBeep();
    await fetchAndSetBook(id, true);
  };

  const handleLookup = (id: string) => fetchAndSetBook(id);

  return (
    <KioskCard flex="row" title={`Start scanning, ${participant.first_name}.`}>
      <div className="w-80 h-full flex flex-col gap-3 overflow-y-scroll scrollbar-none">
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <CheckoutBookLineItem key={index} book={item.book} />
          ))
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
        <BookScannerWrapper<LibraryBook>
          book={currBook}
          setBook={setCurrBook}
          onLookup={handleLookup}
          onScan={handleScan}
          renderBook={(book) => (
            <LookupBookLineItem
              book={book}
              location="lookup"
              isDialogOpen={isScanComplete}
              setIsDialogOpen={(open) => setIsScanComplete(open)}
              participant={participant}
            />
          )}
        />
      </div>
    </KioskCard>
  );
}
