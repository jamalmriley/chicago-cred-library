import { Button } from "@/components//ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useKioskContext } from "@/contexts/kiosk-context";
import { GoogleBooks, KioskItem } from "@/types/library";
import { formatRelative } from "date-fns";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import BookDialog from "./BookDialog";

export default function BookLineItem({
  book,
  kioskItem,
  location = "cart",
}: {
  book: GoogleBooks.Book;
  kioskItem?: KioskItem;
  location?: "cart" | "lookup" | "return";
}) {
  const {
    setCart,
    currBook,
    setCurrBook,
    setMaxCheckoutStepAllowed,
    returns,
    setReturns,
  } = useKioskContext();
  const [checked, setChecked] = useState(false);
  const [didReport, setDidReport] = useState(false);
  const isbn = book.volumeInfo.industryIdentifiers?.[0].identifier || "";
  const today = new Date();
  const [currStep, nextStep] = [2, 3];

  const distanceBetweenDays = (
    date1: Date | string,
    date2: Date | string | null,
  ) => {
    if (!date2) return Infinity;
    const [d1, d2] = [new Date(date1), new Date(date2)];
    return (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
  };

  return (
    <div
      className={`w-full flex flex-col gap-3 border rounded-xl p-3 transition-all ease-in-out duration-200 ${!checked ? "bg-muted/50 max-h-24" : "border-primary max-h-40"}`}
    >
      {/* Image, Details, and Buttons */}
      <div className="w-full flex items-center gap-3">
        <Image
          src={
            book.volumeInfo.imageLinks?.thumbnail.replace(
              "http://",
              "https://",
            ) || ""
          }
          alt={book.volumeInfo.title}
          width={96}
          height={96}
          className={`h-full min-h-16 w-auto aspect-square object-cover rounded-sm shadow-sm transition-all ease-in-out duration-200 ${!checked && location === "return" ? "grayscale" : ""}`} // Crops thumbnail to square
        />
        <div className="flex flex-col gap-1">
          <p
            className={`text-md font-semibold line-clamp-1 transition-all ease-in-out duration-200 ${!checked ? "text-muted-foreground" : ""}`}
          >
            {book.volumeInfo.title}
          </p>
          <p className="text-xs italic text-muted-foreground line-clamp-1">
            {book.volumeInfo.authors?.join(", ")}
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
              <Button
                size="icon"
                onClick={() => {
                  if (currBook) {
                    setCart((prev) => [...prev, currBook]);
                    setCurrBook(null);
                    setMaxCheckoutStepAllowed(nextStep);
                  }
                }}
              >
                <Plus />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => setCurrBook(null)}
              >
                <X />
              </Button>
            </div>
          ) : location === "return" && kioskItem ? (
            <Checkbox
              className="size-7"
              checked={checked}
              onCheckedChange={() => {
                if (checked) {
                  // Remove it from the list of book returns.
                  setChecked(false);
                  const filteredReturns = returns.filter(
                    (kioskItem) => kioskItem.item.id !== book.id,
                  );
                  setReturns(filteredReturns);
                  setMaxCheckoutStepAllowed(
                    filteredReturns.length > 0 ? nextStep : currStep,
                  );
                } else {
                  // Add it to the list of book returns.
                  const newKioskItem: KioskItem = {
                    ...kioskItem,
                    return_date: today,
                    is_returned: true,
                    has_completed_book_report: didReport,
                  };
                  setChecked(true);
                  setReturns((prev) => [...prev, newKioskItem]);
                  setMaxCheckoutStepAllowed(nextStep);
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
