import { Button } from "@/components//ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useKioskContext } from "@/contexts/kiosk-context";
import { useTimeContext } from "@/contexts/time-context";
import { getPreferredIsbn } from "@/lib/utils";
import { Site } from "@/types/cred";
import {
  CheckoutItem,
  CheckoutPurpose,
  GoogleBooks,
  LibraryBook,
} from "@/types/library";
import { formatRelative } from "date-fns";
import { BookMarked, ChevronDown, Plus, X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, Suspense, useState } from "react";
import BookDialog from "./BookDialog";
import SiteDropdownMenuContent from "./SiteDropdownMenuContent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export interface BookDisplayInfo {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  isbn?: string;
}

interface BookLineItemProps {
  book: LibraryBook | GoogleBooks.Book;
  checkoutItem?: CheckoutItem;
  isDialogOpen?: boolean;
  setIsDialogOpen?: Dispatch<SetStateAction<boolean>>;
  isDisabled?: boolean;
  location?: "cart" | "lookup" | "return" | "admin";
  onAdd?: (options?: {
    checkoutPurpose?: CheckoutPurpose;
    site?: Site | null;
  }) => void;
  onRemove?: () => void;
  onReturn?: (item: CheckoutItem, didReport: boolean) => void;
  onUndoReturn?: (bookId: string) => void;
}

function toBookDisplayInfo(
  book: LibraryBook | GoogleBooks.Book,
): BookDisplayInfo {
  // LibraryBook has book_info, GoogleBooks.Book has volumeInfo directly
  const volumeInfo =
    "book_info" in book ? book.book_info.volumeInfo : book.volumeInfo;
  const { title, authors, industryIdentifiers } = volumeInfo;

  return {
    id: book.id,
    title,
    authors,
    thumbnail: volumeInfo.imageLinks?.thumbnail.replace("http://", "https://"),
    isbn: getPreferredIsbn(industryIdentifiers),
  };
}

export function BookLineItem({
  book,
  checkoutItem,
  isDialogOpen,
  setIsDialogOpen,
  isDisabled = false,
  location = "cart",
  onAdd,
  onRemove,
  onReturn,
  onUndoReturn,
}: BookLineItemProps) {
  const { today } = useTimeContext();
  const [checked, setChecked] = useState(false);
  const [checkoutPurpose, setCheckoutPurpose] =
    useState<CheckoutPurpose>(undefined);
  const [didReport, setDidReport] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const displayInfo = toBookDisplayInfo(book);
  const { isbn } = displayInfo;
  const isLibraryBook = "available_count" in book;
  const toggleGroupItems = [
    {
      label: "Me",
      description: "I will read this book myself.",
      value: "self",
    },
    {
      label: "My kid(s)",
      description: "My kid(s) will read this book.",
      value: "child(ren)",
    },
    {
      label: "Me and my kid(s)",
      description: "My kid(s) and I will read this book together.",
      value: "family",
    },
  ];

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
      className={`w-full flex flex-col gap-0 border rounded-xl p-3 transition-all ease-in-out duration-200 ${checked || location === "admin" ? `max-h-40 ${checked ? " border-primary" : ""}` : "bg-muted/50 max-h-24"}`}
    >
      {/* Image, Details, and Buttons */}
      <div className="w-full flex items-center gap-3">
        {displayInfo.thumbnail ? (
          <div
            className={`relative min-h-16 min-w-16 aspect-square shrink-0 rounded-sm shadow-sm overflow-hidden transition-all ease-in-out duration-200 ${!checked && location === "return" ? "grayscale" : ""}`}
          >
            <Image
              src={displayInfo.thumbnail}
              alt={displayInfo.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <span
            className={`min-h-16 min-w-16 aspect-square shrink-0 bg-secondary/25 flex justify-center items-center rounded-sm shadow-sm transition-all ease-in-out duration-200 ${!checked && location === "return" ? "grayscale" : ""}`}
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
          {checkoutItem && (
            <p
              className={`text-xs ${distanceBetweenDays(today, checkoutItem.due_date) <= 5 ? "text-destructive" : "text-primary-foreground"} line-clamp-1 mt-0.5`}
            >
              Due {formatRelative(checkoutItem.due_date, new Date())}
            </p>
          )}
        </div>

        <span className={location === "admin" ? "ml-auto mb-auto" : "ml-auto"}>
          {location === "lookup" ? (
            // Add & cancel buttons
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" disabled={isDisabled}>
                    <Plus />
                  </Button>
                </DialogTrigger>
                {isLibraryBook && (
                  <DialogContent>
                    <DialogHeader className="flex flex-row! items-center gap-3">
                      {displayInfo.thumbnail ? (
                        <div className="relative size-16 aspect-square shrink-0 rounded-sm shadow-sm overflow-hidden">
                          <Image
                            src={displayInfo.thumbnail}
                            alt={displayInfo.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="size-16 aspect-square shrink-0 bg-secondary/25 flex justify-center items-center rounded-sm shadow-sm">
                          <BookMarked className="size-full p-3 text-muted-foreground" />
                        </span>
                      )}

                      <span className="flex flex-col">
                        <DialogTitle>
                          {book.available_count > 0
                            ? `Who is "${displayInfo.title}" for?`
                            : `This book is unavailable.`}
                        </DialogTitle>
                        <DialogDescription>
                          {book.available_count > 0
                            ? "Select an option below."
                            : "Please select another book."}
                        </DialogDescription>
                      </span>
                    </DialogHeader>

                    {book.available_count > 0 ? (
                      <ToggleGroup
                        variant="outline"
                        type="single"
                        orientation="vertical"
                        size="lg"
                        className="w-full"
                        value={checkoutPurpose}
                        onValueChange={(value) => {
                          const newValue = value === "" ? undefined : value;
                          setCheckoutPurpose(newValue as CheckoutPurpose);
                        }}
                      >
                        {toggleGroupItems.map((item, i) => (
                          <ToggleGroupItem
                            key={i}
                            value={item.value}
                            className="h-fit flex flex-col py-2"
                          >
                            <span className="text-lg leading-none font-semibold">
                              {item.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    ) : (
                      <p>
                        <span className="text-muted-foreground dark:text-primary">
                          "{displayInfo.title}"
                        </span>{" "}
                        is currently checked out by another participant. Please
                        see your Site Manager or Educational Support Tutor for
                        more details or assistance.
                      </p>
                    )}

                    <DialogFooter>
                      <DialogClose asChild>
                        {book.available_count > 0 ? (
                          <Button
                            className="w-full molde-button"
                            disabled={checkoutPurpose === undefined}
                            onClick={() => onAdd?.({ checkoutPurpose })}
                          >
                            <Plus />
                            Add book
                          </Button>
                        ) : (
                          <Button
                            className="w-full molde-button"
                            variant="destructive"
                          >
                            Close
                          </Button>
                        )}
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemove?.()}
                disabled={isDisabled}
              >
                <X />
              </Button>
            </div>
          ) : location === "return" && checkoutItem ? (
            // Return checkbox
            <Checkbox
              className="size-7"
              checked={checked}
              onCheckedChange={() => {
                if (checked) {
                  setChecked(false);
                  onUndoReturn?.(book.id);
                } else {
                  const newCheckoutItem: CheckoutItem = {
                    ...checkoutItem,
                    return_date: today,
                    is_returned: true,
                    has_completed_book_report: didReport,
                  };
                  setChecked(true);
                  onReturn?.(newCheckoutItem, didReport);
                }
              }}
            />
          ) : location === "admin" ? (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              onClick={() => onRemove?.()}
              disabled={isDisabled}
            >
              <X />
            </Button>
          ) : (
            isbn && <BookDialog isbn={isbn} />
          )}
        </span>
      </div>

      {/* Add to site buttons */}
      {location === "admin" && (
        <span className="w-full relative flex items-center mt-3">
          <Button
            className="flex-1 rounded-r-none border-r-0"
            disabled={location !== "admin" || !site || isDisabled}
            onClick={() => onAdd?.({ site })}
          >
            {site ? `Add book to ${site.nickname}` : "Add to site"}
          </Button>
          <span className="w-px h-8.5 bg-muted" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="rounded-l-none border-l-0"
                disabled={isDisabled}
              >
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <SiteDropdownMenuContent
              selectedSite={site}
              setSelectedSite={setSite}
            />
          </DropdownMenu>
        </span>
      )}

      {/* Book Report question */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          checked ? "max-h-16 mt-3" : "max-h-0"
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

export function CheckoutBookLineItem({
  book,
  checkoutItem,
}: BookLineItemProps) {
  return (
    <BookLineItem book={book} checkoutItem={checkoutItem} location="cart" />
  );
}

export function AdminBookLineItem({
  book,
  checkoutItem,
  onAdd,
  onRemove,
}: BookLineItemProps) {
  return (
    <Suspense>
      <BookLineItem
        book={book}
        checkoutItem={checkoutItem}
        location="admin"
        onAdd={(site) => onAdd?.(site)}
        onRemove={() => onRemove?.()}
      />
    </Suspense>
  );
}

export function LookupBookLineItem({
  book,
  isDialogOpen,
  setIsDialogOpen,
}: BookLineItemProps) {
  const { currBook, setCurrBook, setCart, setMaxCheckoutStepAllowed } =
    useKioskContext();
  const { today, twoWeeksFromToday } = useTimeContext();

  return (
    <BookLineItem
      book={book}
      isDialogOpen={isDialogOpen} // missing
      setIsDialogOpen={setIsDialogOpen} // missing
      location="lookup"
      onAdd={(options) => {
        if (currBook) {
          const newCheckoutItem: CheckoutItem = {
            book: currBook,
            checkout_date: today,
            checkout_purpose: options?.checkoutPurpose,
            due_date: twoWeeksFromToday,
            return_date: null,
            is_returned: false,
            extension_count: 0,
            has_completed_book_report: false,
          };
          setCart((prev) => [...prev, newCheckoutItem]);
          setCurrBook(null);
          setMaxCheckoutStepAllowed(nextStep);
        }
      }}
      onRemove={() => setCurrBook(null)}
    />
  );
}

export function ReturnBookLineItem({ book, checkoutItem }: BookLineItemProps) {
  const { returns, setReturns, setMaxCheckoutStepAllowed } = useKioskContext();
  return (
    <BookLineItem
      book={book}
      checkoutItem={checkoutItem}
      location="return"
      onReturn={(newCheckoutItem) => {
        setReturns((prev) => [...prev, newCheckoutItem]);
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
