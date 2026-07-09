"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getPreferredIsbn } from "@/lib/utils";
import { Site } from "@/types/cred";
import { GoogleBooks, LibraryBook } from "@/types/library";
import { Location } from "@/types/ui";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import {
  Barcode,
  Book,
  BookCopy,
  CameraOff,
  OctagonX,
  Scan,
  ScanBarcode,
  Search,
  Slash,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import SiteDropdown from "./SiteDropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app-context";

export interface BookScannerProps<T> {
  book: T | null;
  setBook: (book: T | null) => void;
  cart?: GoogleBooks.Book[];
  setCart?: Dispatch<SetStateAction<GoogleBooks.Book[]>>;
  isContinuous?: boolean;
  setIsContinuous?: Dispatch<SetStateAction<boolean>>;
  location?: Location;
  onLookup: (isbn: string) => Promise<void>;
  onScan: (isbn: string) => void;
  renderBook?: (book: T) => React.ReactNode;
  renderButton?: boolean;
  selectedSite?: Site | null;
  setSelectedSite?: React.Dispatch<React.SetStateAction<Site | null>>;
  setLastUpdated?: Dispatch<SetStateAction<string>>;
}

export default function BookScanner<T>({
  book,
  setBook,
  cart,
  setCart,
  isContinuous,
  setIsContinuous,
  location,
  onLookup,
  onScan,
  renderBook,
  renderButton,
  selectedSite,
  setSelectedSite,
  setLastUpdated,
}: BookScannerProps<T>) {
  const { today } = useAppContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isManualSearchEnabled, setIsManualSearchEnabled] = useState(false);
  const [isManualSearchLoading, setIsManualSearchLoading] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");

  const handleUpsertBooks = async (cart: GoogleBooks.Book[] | undefined) => {
    if (
      !cart ||
      !setCart ||
      !selectedSite ||
      !setLastUpdated ||
      cart.length === 0
    )
      return; // Return early if the cart is empty or a site isn't selected.

    await setIsLoading(true);

    const uniqueBookIds = new Set(); // Unique array of book IDs in the cart.
    const booksToAdd: LibraryBook[] = []; // Books to add to the library.
    const booksToUpdate: LibraryBook[] = []; // Books that have already been added and need to be updated in the library.

    const getLibraryId = (site: Site, book: GoogleBooks.Book) =>
      `${site.id}_${getPreferredIsbn(book.volumeInfo.industryIdentifiers)}`;

    const uniqueCart = cart.filter((book) => {
      const libraryId = getLibraryId(selectedSite, book);
      if (uniqueBookIds.has(libraryId)) return false; // Skip this object
      uniqueBookIds.add(libraryId); // Track this ID for future iterations
      return true; // Keep this object
    });

    const res = await fetch("/api/library"); // Fetch all books.
    if (!res.ok) {
      toast.error(
        `There was an issue fetching library information. Please try again.`,
        {
          position: "bottom-right",
        },
      );
      return;
    }

    const libraryBooks: LibraryBook[] = await res.json();

    // Sort through the books in the cart to see which books are already in the library and which ones are new.
    for (const book of uniqueCart) {
      const libraryId = getLibraryId(selectedSite, book);
      const libraryBook = libraryBooks.find(
        (libraryBook) => libraryBook.id === libraryId,
      );

      if (libraryBook) {
        const { available_count, total_count } = libraryBook;
        const newBooksCount = cart.filter(
          (bookInCart) =>
            getPreferredIsbn(bookInCart.volumeInfo.industryIdentifiers) ===
            getPreferredIsbn(
              libraryBook.book_info.volumeInfo.industryIdentifiers,
            ),
        ).length;

        booksToUpdate.push({
          ...libraryBook,
          available_count: available_count + newBooksCount,
          total_count: total_count + newBooksCount,
          updated_at: today,
        });
      } else {
        const newBooksCount = cart.filter(
          (bookInCart) =>
            getPreferredIsbn(bookInCart.volumeInfo.industryIdentifiers) ===
            getPreferredIsbn(book.volumeInfo.industryIdentifiers),
        ).length;

        booksToAdd.push({
          id: getLibraryId(selectedSite, book),
          book_info: book,
          site: selectedSite,
          available_count: newBooksCount,
          total_count: newBooksCount,
          created_at: today,
          updated_at: today,
          checkout_history: null,
        });
      }
    }

    await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([...booksToAdd, ...booksToUpdate]),
    })
      .then(() => {
        toast.success(
          `${cart.length} ${cart.length === 1 ? "book" : "books"} successfully added to the library.`,
          {
            position: "bottom-right",
          },
        );
        setCart([]);
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          "There was an issue adding these books to the library. Please try again.",
          {
            position: "bottom-right",
          },
        );
      })
      .finally(() => setIsLoading(false));
  };

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
    <div className="w-96 max-w-full h-full flex flex-col items-center gap-5">
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

        {/* Continuous Mode */}
        {location === "admin-scan" && isScanning && (
          <div className="absolute top-3 right-3 z-20">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsContinuous?.((prev) => !prev)}
                >
                  {/* 1. Relative wrapper to constrain the absolute layers */}
                  <div className="size-full grid place-items-center select-none">
                    {/* Layer 1: Base Background Icon */}
                    <Scan className="size-full p-0.5 col-start-1 row-start-1" />

                    {/* Layer 2: Scaled Secondary Icon */}
                    {isContinuous ? (
                      <BookCopy className="size-full p-2 col-start-1 row-start-1" />
                    ) : (
                      <Book className="size-full p-2 col-start-1 row-start-1" />
                    )}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isContinuous ? (
                  <span className="flex flex-col">
                    <p>Scan multiple books at a time.</p>
                    <p>Click to switch modes.</p>
                  </span>
                ) : (
                  <span className="flex flex-col">
                    <p>Scan books one at a time.</p>
                    <p>Click to switch modes.</p>
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
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
          <Field className="flex flex-col">
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
          </Field>
        )}

        <Button
          variant="outline"
          className="molde-button"
          disabled={
            isManualSearchLoading ||
            (isManualSearchEnabled && manualIsbn === "")
          }
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
          {isManualSearchLoading
            ? "Searching..."
            : isManualSearchEnabled
              ? "Search"
              : "Search for a book"}
          {isManualSearchLoading && <Spinner />}
        </Button>
      </div>
      {isManualSearchEnabled && (
        <span className="text-xs text-muted-foreground">
          Enter the 10- or 13-digit ISBN number, without dashes. For comic
          books, enter the 12-digit serial number.
        </span>
      )}
      {isManualSearchEnabled && (!book || renderButton) && (
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
      {book && renderBook && !renderButton && (
        <>
          <Separator
            decorative
            className="bg-transparent border-t border-dashed"
          />
          {renderBook(book)}
        </>
      )}
      {/* "Add to site" button (admin only) */}
      {renderButton && (
        <span className="w-full h-9 relative flex items-center mt-auto">
          <Button
            className="flex-1 rounded-r-none border-r-0 molde-button"
            disabled={
              isLoading || !selectedSite || (cart && cart.length === 0)
            }
            onClick={() => handleUpsertBooks(cart)}
          >
            {selectedSite
              ? cart && cart.length !== 0
                ? `${isLoading ? "Adding" : "Add"} ${cart.length} ${cart.length === 1 ? "book" : "books"} to ${selectedSite.nickname}${isLoading ? "..." : ""}`
                : `Add books to ${selectedSite.nickname}`
              : "Select a site"}
            {isLoading && <Spinner />}
          </Button>
          <span className="w-px h-8.5 bg-muted" />
          <SiteDropdown
            selectedSite={selectedSite ?? null}
            setSelectedSite={setSelectedSite!}
          />
        </span>
      )}
    </div>
  );
}

export function ContinuousModeButton({
  isEnabled,
  setIsEnabled,
}: {
  isEnabled: boolean;
  setIsEnabled: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsEnabled((prev) => !prev)}
    >
      {/* 1. Relative wrapper to constrain the absolute layers */}
      <div className="relative h-4 w-4 flex items-center justify-center select-none">
        {/* Layer 1: Base Background Icon */}
        <Scan className="absolute inset-0 h-full w-full text-muted-foreground" />

        {/* Layer 2: Scaled Secondary Icon */}
        {!isEnabled && (
          <Slash className="absolute h-3 w-3 top-[-2px] right-[-2px] text-amber-500" />
        )}

        {/* Layer 3: Centered Letter */}
        <span className="absolute text-[9px] font-extrabold leading-none text-foreground pb-[1px]">
          C
        </span>
      </div>
    </Button>
  );
}
