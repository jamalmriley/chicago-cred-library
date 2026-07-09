"use client";

import { Button } from "@/components//ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppContext } from "@/contexts/app-context";
import { useKioskContext } from "@/contexts/kiosk-context";
import { getPreferredIsbn } from "@/lib/utils";
import { getSiteById, Participant, Site } from "@/types/cred";
import {
  CheckoutItem,
  CheckoutPurpose,
  GoogleBooks,
  LibraryBook,
} from "@/types/library";
import { Location } from "@/types/ui";
import { formatRelative } from "date-fns";
import { BookMarked, Plus, X } from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { Dispatch, SetStateAction, Suspense, useState } from "react";
import { toast } from "sonner";
import { AdminBookInfoDialog, KioskBookInfoDialog } from "./BookDialog";
import SiteDropdown from "./SiteDropdown";
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
  index?: number;
  isDialogOpen?: boolean;
  setIsDialogOpen?: Dispatch<SetStateAction<boolean>>;
  isDisabled?: boolean;
  location?: Location;
  participant?: Participant;
  onAdd?: (options?: {
    book?: GoogleBooks.Book;
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

function BookLineItem({
  book,
  checkoutItem,
  index,
  isDialogOpen,
  setIsDialogOpen,
  isDisabled = false,
  location = "checkout",
  onAdd,
  onRemove,
  onReturn,
  onUndoReturn,
}: BookLineItemProps) {
  const { today } = useAppContext();
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
    <Suspense>
      <div
        className={`w-full flex flex-col gap-0 border rounded-xl p-3 transition-all ease-in-out duration-200 ${checked || location === "admin-scan" ? `max-h-40 ${checked ? " border-primary" : ""}` : "bg-muted/50 max-h-24"}`}
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

          <span
            className={
              location === "admin-scan" ? "ml-auto mb-auto" : "ml-auto"
            }
          >
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
                    <DialogContent
                      onInteractOutside={(e) => e.preventDefault()}
                    >
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
                          is currently checked out by another participant.
                          Please see your tutor for more details or assistance.
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
            ) : location === "admin-scan" ? (
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-muted-foreground"
                onClick={() => onRemove?.()}
                disabled={isDisabled}
              >
                <X />
              </Button>
            ) : location === "admin-cart" ? (
              typeof index === "number" &&
              isbn && <AdminBookInfoDialog index={index} isbn={isbn} />
            ) : (
              typeof index === "number" &&
              isbn && <KioskBookInfoDialog index={index} isbn={isbn} />
            )}
          </span>
        </div>

        {/* Add to site buttons */}
        {location === "admin-scan" && (
          <span className="w-full relative flex items-center mt-3">
            <Button
              className="flex-1 rounded-r-none border-r-0 molde-button"
              disabled={!site || isDisabled}
              onClick={() => onAdd?.({ site })}
            >
              {site ? `Add book to ${site.nickname}` : "Select a site"}
            </Button>
            <span className="w-px h-8.5 bg-muted" />
            <SiteDropdown
              isDisabled={isDisabled}
              selectedSite={site}
              setSelectedSite={setSite}
            />
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
    </Suspense>
  );
}

const [currStep, nextStep] = [2, 3];

export function CheckoutBookLineItem({
  book,
  index,
  checkoutItem,
}: BookLineItemProps) {
  return (
    <BookLineItem
      book={book}
      checkoutItem={checkoutItem}
      index={index}
      location="checkout"
    />
  );
}

export function AdminCartBookLineItem({ book, index }: BookLineItemProps) {
  return <BookLineItem book={book} index={index} location="admin-cart" />;
}

export function AdminScanBookLineItem({
  book,
  checkoutItem,
  onAdd,
  onRemove,
}: BookLineItemProps) {
  return (
    <BookLineItem
      book={book}
      checkoutItem={checkoutItem}
      location="admin-scan"
      onAdd={(site) => onAdd?.(site)}
      onRemove={() => onRemove?.()}
    />
  );
}

export function LookupBookLineItem({
  book,
  isDialogOpen,
  setIsDialogOpen,
  participant,
}: BookLineItemProps) {
  const { currBook, setCurrBook, cart, setCart, setMaxCheckoutStepAllowed } =
    useKioskContext();
  const {
    sites,
    today,
    oneWeekFromToday,
    twoWeeksFromToday,
    threeWeeksFromToday,
    oneMonthFromToday,
  } = useAppContext();
  const [site] = useQueryState("site");

  return (
    <BookLineItem
      book={book}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
      location="lookup"
      participant={participant}
      onAdd={(options) => {
        if (!sites || !participant) return;
        const siteInfo = getSiteById(site, sites);
        if (currBook && siteInfo && siteInfo.settings) {
          const { book_checkout_limit, kiosk_checkout_limit, return_window } =
            siteInfo.settings;
          const checkedOutBookCount =
            participant.checkout_history?.filter(
              (checkoutItem) => !checkoutItem.is_returned,
            ).length ?? 0;
          const canAddBooks =
            cart.length + 1 <=
            Math.min(
              !book_checkout_limit || book_checkout_limit === "Unlimited"
                ? Number.POSITIVE_INFINITY
                : book_checkout_limit - checkedOutBookCount,
              !kiosk_checkout_limit || kiosk_checkout_limit === "Unlimited"
                ? Number.POSITIVE_INFINITY
                : kiosk_checkout_limit,
            );

          if (canAddBooks) {
            let due_date: Date;
            switch (return_window) {
              case "1 week":
                due_date = oneWeekFromToday;
                break;
              case "2 weeks":
                due_date = twoWeeksFromToday;
                break;
              case "3 weeks":
                due_date = threeWeeksFromToday;
                break;
              case "1 month":
                due_date = oneMonthFromToday;
                break;
              default:
                due_date = oneWeekFromToday;
                break;
            }

            const newCheckoutItem: CheckoutItem = {
              book: currBook,
              checkout_date: today,
              checkout_purpose: options?.checkoutPurpose,
              due_date,
              return_date: null,
              is_returned: false,
              extension_count: 0,
              has_completed_book_report: false,
            };
            setCart((prev) => [...prev, newCheckoutItem]);
            setCurrBook(null);
            setMaxCheckoutStepAllowed(nextStep);
          } else {
            toast.error("Checkout limit reached.", {
              position: "bottom-right",
            });
          }
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
