"use client";

import KioskCard from "./KioskCard";
import { Separator } from "@/components/ui/separator";
import BookLineItem from "./BookLineItem";
import { useState } from "react";
import { GoogleBooksResponse } from "@/types";
import { Button } from "./ui/button";
import { BookScannerWrapper } from "./BookScannerWrapper";
import { CameraOff, LibraryBig, ScanBarcode } from "lucide-react";
import { useSound } from "use-sound";

export default function BookCheckout({ name }: { name: string }) {
  const [showScanner, setShowScanner] = useState(false);
  const [data, setData] = useState<GoogleBooksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playBeep] = useSound("/sounds/beep.m4a", { volume: 0.5 });

  const handleScan = (isbn: string) => {
    setShowScanner(false);
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.items) {
          setError("No book found for that barcode. Try scanning again.");
          return;
        }
        playBeep();
        setData(data);
      });
  };

  return (
    <KioskCard title={`Start scanning, ${name}.`}>
      <div className="w-1/2 h-full flex flex-col gap-3 overflow-y-hidden">
        {data?.items ? (
          data.items.map((item) => (
            <BookLineItem key={item.id} book={item.volumeInfo} />
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
