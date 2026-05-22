"use client";

import { Separator } from "@/components/ui/separator";
import { useKioskContext } from "@/contexts/kiosk-context";
import { LibraryBig } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "use-sound";
import BookLineItem from "./BookLineItem";
import { BookScannerWrapper } from "./BookScannerWrapper";
import KioskCard from "./KioskCard";
import { Participant } from "@/types/cred";
import { GoogleBooks } from "@/types/library";

export default function BookCheckout({
  participant,
}: {
  participant: Participant;
}) {
  const { cart, setCart, setCurrBook, setMaxCheckoutStepAllowed } =
    useKioskContext();
  const [playBeep] = useSound("/sounds/beep.m4a", { volume: 0.5 });

  const handleScan = async (isbn: string) => {
    playBeep();
    const book = await fetchBook(isbn);
    if (!book) return;
    setCart((prev) => (prev ? [...prev, book] : [book]));
    setMaxCheckoutStepAllowed(3);
  };

  const handleLookup = async (isbn: string) => {
    const book = await fetchBook(isbn);
    if (!book) return;
    setCurrBook(book);
  };

  const fetchBook = async (isbn: string): Promise<GoogleBooks.Book | null> => {
    try {
      const res = await fetch(`/api/books?isbn=${isbn}`);

      if (res.status === 404) {
        toast.error("Book not found. Please try again.", {
          position: "bottom-right",
        });
        return null;
      }

      if (!res.ok) {
        toast.error(
          "An error occurred while gathering book info. Please try again.",
          { position: "bottom-right" },
        );
        return null;
      }

      return (await res.json()) as GoogleBooks.Book;
    } catch (err) {
      const error = err as GoogleBooks.ErrorResponse;
      toast.error(
        error?.error?.message ||
          "An error occurred while gathering book info. Please try again.",
        { position: "bottom-right" },
      );
      return null;
    }
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
        <BookScannerWrapper onLookup={handleLookup} onScan={handleScan} />
      </div>
    </KioskCard>
  );
}
