"use client";

import { Button } from "@/components/ui/button";
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

interface BookScannerProps {
  onScan: (isbn: string) => void;
}

export default function BookScanner({ onScan }: BookScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

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
    <div className="w-full flex flex-col items-center gap-5">
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

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-24 flex justify-center items-center border-4 border-card/70 rounded text-card/70">
              <Barcode className="size-20 animate-pulse" />
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent to-25% pointer-events-none" />
        )}

        {isScanning && !error && (
          <p className="w-full absolute bottom-3 text-center text-sm text-white font-semibold">
            Aim the book's barcode in the white frame.
          </p>
        )}

        {error && (
          <p className="w-full absolute bottom-3 text-center text-sm text-destructive-foreground font-semibold">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={isScanning ? "destructive" : "default"}
          onClick={() => (isScanning ? stopScanning() : setIsScanning(true))}
        >
          {isScanning ? <OctagonX /> : <ScanBarcode />}
          {isScanning ? "Stop" : "Start"} scanning
        </Button>

        <Button variant="outline">
          <Search />
          Search for a book
        </Button>
      </div>
    </div>
  );
}
