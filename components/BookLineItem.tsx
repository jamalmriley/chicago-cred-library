import { Button } from "@/components//ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useKioskContext } from "@/contexts/kiosk-context";
import { GoogleBooks, KioskItem, LibraryBook } from "@/types/library";
import { formatRelative } from "date-fns";
import { BookMarked, Plus, X } from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";
import BookDialog from "./BookDialog";
import { useAdminContext } from "@/contexts/admin-context";
import { getSiteById } from "@/types/cred";
import { useQueryState } from "nuqs";

export interface BookDisplayInfo {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  isbn?: string;
}

interface BookLineItemProps {
  book: LibraryBook | GoogleBooks.Book;
  kioskItem?: KioskItem;
  location?: "cart" | "lookup" | "return";
  onAdd?: () => void;
  onRemove?: () => void;
  onReturn?: (item: KioskItem, didReport: boolean) => void;
  onUndoReturn?: (bookId: string) => void;
}

function toBookDisplayInfo(
  book: LibraryBook | GoogleBooks.Book,
): BookDisplayInfo {
  // LibraryBook has book_info, GoogleBooks.Book has volumeInfo directly
  const volumeInfo =
    "book_info" in book ? book.book_info.volumeInfo : book.volumeInfo;

  return {
    id: book.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors,
    thumbnail: volumeInfo.imageLinks?.thumbnail.replace("http://", "https://"),
    isbn: volumeInfo.industryIdentifiers?.[0]?.identifier,
  };
}

export function BookLineItem({
  book,
  kioskItem,
  location = "cart",
  onAdd,
  onRemove,
  onReturn,
  onUndoReturn,
}: BookLineItemProps) {
  const displayInfo = toBookDisplayInfo(book);

  const [checked, setChecked] = useState(false);
  const [didReport, setDidReport] = useState(false);
  const isbn = displayInfo.isbn || "";
  const today = new Date();

  const distanceBetweenDays = (
    date1: Date | string,
    date2: Date | string | null,
  ) => {
    if (!date2) return Infinity;
    const [d1, d2] = [new Date(date1), new Date(date2)];
    return (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24); // ms * sec * min * hr
  };

  return (
    <div
      className={`w-full flex flex-col gap-3 border rounded-xl p-3 transition-all ease-in-out duration-200 ${!checked ? "bg-muted/50 max-h-24" : "border-primary max-h-40"}`}
    >
      {/* Image, Details, and Buttons */}
      <div className="w-full flex items-center gap-3">
        {displayInfo.thumbnail ? (
          <Image
            src={displayInfo.thumbnail}
            alt={displayInfo.title}
            width={96}
            height={96}
            className={`h-full min-h-16 w-auto aspect-square object-cover rounded-sm shadow-sm transition-all ease-in-out duration-200 ${!checked && location === "return" ? "grayscale" : ""}`} // Crops thumbnail to square
          />
        ) : (
          <span
            className={`h-full min-h-16 w-auto aspect-square bg-secondary/25 flex justify-center items-center rounded-sm shadow-sm transition-all ease-in-out duration-200 ${!checked && location === "return" ? "grayscale" : ""}`}
          >
            <BookMarked className="size-full p-3 text-muted-foreground" />
          </span>
        )}
        <div className="flex flex-col gap-1">
          <p
            className={`text-md font-semibold line-clamp-1 transition-all ease-in-out duration-200 ${!checked ? "text-muted-foreground" : ""}`}
          >
            {displayInfo.title}
          </p>
          <p className="text-xs italic text-muted-foreground line-clamp-1">
            {displayInfo.authors?.join(", ")}
          </p>
          {kioskItem && (
            <p
              className={`text-xs ${distanceBetweenDays(today, kioskItem.due_date) <= 5 ? "text-destructive" : "text-primary-foreground"} line-clamp-1 mt-0.5`}
            >
              Due {formatRelative(kioskItem.due_date, new Date())}
            </p>
          )}
        </div>

        <span className="ml-auto">
          {location === "lookup" ? (
            // Add & cancel buttons
            <div className="flex gap-2">
              <Button size="icon" onClick={() => onAdd?.()}>
                <Plus />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemove?.()}
              >
                <X />
              </Button>
            </div>
          ) : location === "return" && kioskItem ? (
            // Return checkbox
            <Checkbox
              className="size-7"
              checked={checked}
              onCheckedChange={() => {
                if (checked) {
                  setChecked(false);
                  onUndoReturn?.(book.id);
                } else {
                  const newKioskItem: KioskItem = {
                    ...kioskItem,
                    return_date: today,
                    is_returned: true,
                    has_completed_book_report: didReport,
                  };
                  setChecked(true);
                  onReturn?.(newKioskItem, didReport);
                }
              }}
            />
          ) : (
            <BookDialog isbn={isbn} />
          )}
        </span>
      </div>

      {/* Book Report question */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          checked ? "max-h-16" : "max-h-0"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-sm">
          <span className="text-xs font-medium">
            Did you complete a book report?
          </span>

          <ButtonGroup>
            <Button
              size="xs"
              variant={didReport === true ? "secondary" : "outline"}
              onClick={() => setDidReport(true)}
            >
              Yes
            </Button>
            <Button
              size="xs"
              variant={didReport === false ? "secondary" : "outline"}
              onClick={() => setDidReport(false)}
            >
              No
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}

const [currStep, nextStep] = [2, 3];

export function CheckoutBookLineItem({ book, kioskItem }: BookLineItemProps) {
  return <BookLineItem book={book} kioskItem={kioskItem} location="cart" />;
}

export function AdminBookLineItem({ book, kioskItem }: BookLineItemProps) {
  const [site] = useQueryState("site");
  return (
    <Suspense>
      <BookLineItem
        book={book}
        kioskItem={kioskItem}
        location="lookup"
        onAdd={() => {
          const created_at = new Date();
          const siteInfo = getSiteById(site);
          if (!siteInfo) return;

          const libraryBook: LibraryBook =
            "book_info" in book
              ? book
              : {
                  id: `${siteInfo.id}_${book.volumeInfo.industryIdentifiers[0].identifier}`,
                  book_info: book,
                  site: siteInfo,
                  available_count: 1,
                  total_count: 1,
                  created_at,
                  updated_at: created_at,
                  checkout_history: null,
                };

          // handleAddBook(libraryBook); // TODO: Figure out a way to link this.
        }}
        onRemove={() => {}}
      />
    </Suspense>
  );
}

export function LookupBookLineItem({ book, kioskItem }: BookLineItemProps) {
  const { currBook, setCurrBook, setCart, setMaxCheckoutStepAllowed } =
    useKioskContext();
  return (
    <BookLineItem
      book={book}
      kioskItem={kioskItem}
      location="lookup"
      onAdd={() => {
        if (currBook) {
          setCart((prev) => [...prev, currBook]);
          setCurrBook(null);
          setMaxCheckoutStepAllowed(nextStep);
        }
      }}
      onRemove={() => setCurrBook(null)}
    />
  );
}

export function ReturnBookLineItem({ book, kioskItem }: BookLineItemProps) {
  const { returns, setReturns, setMaxCheckoutStepAllowed } = useKioskContext();
  return (
    <BookLineItem
      book={book}
      kioskItem={kioskItem}
      location="return"
      onReturn={(newKioskItem) => {
        setReturns((prev) => [...prev, newKioskItem]);
        setMaxCheckoutStepAllowed(nextStep);
      }}
      onUndoReturn={(bookId) => {
        const filteredReturns = returns.filter((r) => r.book.id !== bookId);
        setReturns(filteredReturns);
        setMaxCheckoutStepAllowed(
          filteredReturns.length > 0 ? nextStep : currStep,
        );
      }}
    />
  );
}
