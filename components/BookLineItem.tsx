import { Button } from "@/components//ui/button";
import { useKioskContext } from "@/contexts/kiosk-context";
import { Item } from "@/types/books";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import BookDialog from "./BookDialog";

export default function BookLineItem({
  book,
  location = "cart",
}: {
  book: Item;
  location?: "cart" | "lookup";
}) {
  const { cart, setCart, currBook, setCurrBook, setMaxCheckoutStepAllowed } =
    useKioskContext();
  const isbn = book.volumeInfo.industryIdentifiers?.[0].identifier || "";
  return (
    <div className="w-full h-24 flex items-center gap-3 border rounded-xl p-3">
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
        className="h-full w-auto aspect-square object-cover rounded-sm shadow-sm" // Crops thumbnail to square
      />
      <div className="flex flex-col gap-1">
        <p className="text-md font-semibold leading-none line-clamp-1">
          {book.volumeInfo.title}
        </p>
        <p className="text-xs italic text-muted-foreground line-clamp-1">
          {book.volumeInfo.authors?.join(", ")}
        </p>
      </div>

      <span className="ml-auto">
        {location === "cart" ? (
          <BookDialog isbn={isbn} />
        ) : (
          <div className="flex gap-2">
            <Button
              size="icon"
              onClick={() => {
                if (currBook) {
                  setCart((prev) => [...prev, currBook]);
                  setCurrBook(null);
                  setMaxCheckoutStepAllowed(3);
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
        )}
      </span>
    </div>
  );
}
