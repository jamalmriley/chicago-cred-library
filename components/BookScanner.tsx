"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import {
  Barcode,
  CameraOff,
  OctagonX,
  ScanBarcode,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface BookScannerProps<T> {
  book: T | null;
  setBook: (book: T | null) => void;
  onLookup: (isbn: string) => Promise<void>;
  onScan: (isbn: string) => void;
  renderBook?: (book: T) => React.ReactNode; // ← add this
}

export default function BookScanner<T>({
  onLookup,
  onScan,
  book,
  setBook,
  renderBook,
}: BookScannerProps<T>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isManualSearchEnabled, setIsManualSearchEnabled] = useState(false);
  const [isManualSearchLoading, setIsManualSearchLoading] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");

  useEffect(() => {
    if (!isScanning) return; // ← stops the loop; effect does nothing when false
    if (!videoRef.current) return;

    readerRef.current = new BrowserMultiFormatReader();
    const codeReader = readerRef.current;

    setError(null);

    codeReader
      .decodeFromVideoDevice(
        undefined, // Uses default camera
        videoRef.current,
        (result, err) => {
          if (result) {
            const isbn = result.getText();

            // Ignore if same barcode or in cooldown
            if (cooldownRef.current || isbn === lastScannedRef.current) return;

            cooldownRef.current = true;
            lastScannedRef.current = isbn;
            onScan(isbn);

            // Reset cooldown after 2 seconds
            setTimeout(() => {
              cooldownRef.current = false;
              lastScannedRef.current = null;
            }, 2000);
          }
          if (err && !(err instanceof NotFoundException)) {
            setError("Camera error: " + err.message);
            setIsScanning(false);
          }
        },
      )
      .catch((err) => {
        setError("Could not access camera: " + err.message);
        setIsScanning(false);
      });

    return () => {
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [isScanning]);

  const stopScanning = () => {
    if (readerRef.current) {
      BrowserMultiFormatReader.releaseAllStreams();
    }
    setIsScanning(false);
  };

  return (
    <div className="w-96 max-w-full flex flex-col items-center gap-5">
      {/* Video container */}
      <div className="w-full relative aspect-video border rounded-xl bg-muted text-muted-foreground overflow-hidden">
        {isScanning ? (
          <video
            ref={videoRef}
            className="size-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="size-full flex flex-col justify-center items-center">
            <CameraOff className="size-20" />
          </div>
        )}

        {/* Overlays */}
        {isScanning && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-24 flex justify-center items-center border-4 border-card/70 rounded text-card/70">
                <Barcode className="size-20 animate-pulse" />
              </div>
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent to-25% pointer-events-none" />
            {/* <div className="absolute inset-0 bg-background/30 backdrop-blur-lg" /> */}
          </>
        )}

        {/* Overlay Text */}
        {isScanning && !error && (
          <p
            className={`w-full absolute bottom-3 text-center text-sm font-semibold ${error ? "text-destructive-foreground" : "text-white"}`}
          >
            {error ? error : "Aim the book's barcode in the white frame."}
          </p>
        )}
      </div>

      <div className="w-full flex justify-center gap-2">
        {!isManualSearchEnabled && (
          <Button
            variant={isScanning ? "destructive" : "default"}
            className="molde-button"
            onClick={() => (isScanning ? stopScanning() : setIsScanning(true))}
          >
            {isScanning ? <OctagonX /> : <ScanBarcode />}
            {isScanning ? "Stop" : "Start"} scanning
          </Button>
        )}

        {isManualSearchEnabled && (
          <div className="flex flex-col">
            <Field>
              <div className="w-full relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Type an ISBN number..."
                  className="w-full pl-8"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                />
              </div>
              <FieldDescription>
                Enter the 10- or 13-digit ISBN code, without dashes.
              </FieldDescription>
            </Field>
          </div>
        )}

        <Button
          variant="outline"
          className="molde-button"
          disabled={isManualSearchLoading}
          onClick={async () => {
            if (isScanning) stopScanning();
            setIsManualSearchEnabled(true);
            if (manualIsbn !== "") {
              setIsManualSearchLoading(true);
              await onLookup(manualIsbn);
              setIsManualSearchLoading(false);
            }
          }}
        >
          {!isManualSearchEnabled && <Search />}
          {isManualSearchLoading && <Spinner />}
          {isManualSearchLoading
            ? "Searching..."
            : isManualSearchEnabled
              ? "Search"
              : "Search for a book"}
        </Button>
      </div>

      {isManualSearchEnabled && !book && (
        <Button
          size="xs"
          variant="link"
          onClick={() => {
            setIsScanning(true);
            setIsManualSearchEnabled(false);
            setBook(null);
          }}
        >
          Scan your books instead
        </Button>
      )}

      {/* Book Image and Details */}
      {book && renderBook && (
        <>
          <Separator
            decorative
            className="bg-transparent border-t border-dashed"
          />
          {renderBook(book)}
        </>
      )}
    </div>
  );
}
