"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { Button } from "./ui/button";
import { Barcode, CameraOff, OctagonX, ScanBarcode } from "lucide-react";

interface BookScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export default function BookScanner({ onScan, onClose }: BookScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    const codeReader = readerRef.current;

    if (!videoRef.current) return;

    setScanning(true);
    setError(null);

    codeReader
      .decodeFromVideoDevice(
        undefined, // Uses default camera
        videoRef.current,
        (result, err) => {
          if (result) {
            const isbn = result.getText();
            onScan(isbn);
            stopScanning();
          }
          if (err && !(err instanceof NotFoundException)) {
            setError("Camera error: " + err.message);
            setScanning(false);
          }
        },
      )
      .catch((err) => {
        setError("Could not access camera: " + err.message);
        setScanning(false);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = () => {
    if (readerRef.current) {
      BrowserMultiFormatReader.releaseAllStreams();
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Video container */}
      <div className="w-full relative aspect-video border rounded-xl bg-muted text-muted-foreground overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" />

        {/* Scanning overlay */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-24 flex justify-center items-center border-4 border-card/70 rounded text-card/70">
              <Barcode className="size-20 animate-pulse" />
            </div>
          </div>
        )}

        {error && (
          <p className="w-full absolute bottom-3 text-center text-sm text-destructive-foreground font-semibold">
            {error}
          </p>
        )}

        {/* Gradient overlay */}
        {scanning && !error && (
          <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent to-25% pointer-events-none" />
        )}

        {scanning && !error && (
          <p className="w-full absolute bottom-3 text-center text-sm text-white font-semibold">
            Aim the book's barcode in the white frame.
          </p>
        )}
      </div>

      <Button variant="destructive" onClick={handleClose}>
        <OctagonX />
        Stop scanning
      </Button>
    </div>
  );
}
