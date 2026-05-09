import { Button } from "@/components//ui/button";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { Item } from "@/types/books";
import Image from "next/image";
import BookDialog from "./BookDialog";

export default function BookLineItem({
  book,
  location = "cart",
}: {
  book: Item;
  location?: "cart" | "lookup";
}) {
  const { setCart, currBook, setCurrBook } = useCheckoutContext();
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
          <Button
            onClick={() => {
              if (currBook) {
                setCart((prev) => [...prev, currBook]);
                setCurrBook(null);
              }
            }}
          >
            Add to cart
          </Button>
        )}
      </span>
    </div>
  );
}
