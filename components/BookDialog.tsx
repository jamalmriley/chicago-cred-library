"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { GoogleBooksResponse, Item } from "@/types/books";
import { format } from "date-fns";
import { EllipsisVertical, Info, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function BookDialog({ isbn }: { isbn: string }) {
  const { cart, setCart } = useCheckoutContext();
  const [book, setBook] = useState<Item | null>(null);
  useEffect(() => {
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
    )
      .then((res) => res.json())
      .then((data: GoogleBooksResponse) =>
        setBook(data ? data.items[0] : null),
      );
  }, []);

  const removeFromCart = (item: Item) => {
    const filteredCart = cart.filter((itm) => itm.id !== item.id);
    setCart(filteredCart);
  };

  return (
    book && (
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="rounded-full">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Info />
                More info
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => removeFromCart(book)}
            >
              <Trash2 />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="w-1/2 min-w-137.5">
          <DialogHeader className="sr-only">
            <DialogTitle>{book.volumeInfo.title}</DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="flex flex-col gap-3">
            {/* Book Image and Details */}
            <div className="flex gap-5">
              <Image
                src={book.volumeInfo.imageLinks.thumbnail.replace(
                  "http://",
                  "https://",
                )}
                alt={book.volumeInfo.title}
                width={200}
                height={200}
                className="w-24 h-auto aspect-auto shrink-0 rounded-sm shadow-sm" // Maintains thumbnail aspect ratio
              />
              {/* Book Details */}
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <span className="text-base text-primary-foreground font-bold leading-none line-clamp-1">
                  {book.volumeInfo.title}
                </span>
                <span className="text-sm italic line-clamp-1">
                  {book.volumeInfo.authors.join(", ")}
                </span>
                {/* Categories */}
                <span>
                  <span className="font-bold">
                    Genre
                    {book.volumeInfo.categories?.length !== 1 ? "s" : ""}:{" "}
                  </span>{" "}
                  {book.volumeInfo.categories?.join(", ")}
                </span>
                {/* Page Count and Points */}
                <span>
                  <span className="font-bold">Pages: </span>{" "}
                  {book.volumeInfo.pageCount}
                  {" | "}
                  <span className="font-bold">Points: </span>{" "}
                  {Math.round(book.volumeInfo.pageCount * 0.5)}
                </span>
                {/* Year Published */}
                <span>
                  <span className="font-bold">Year Published: </span>{" "}
                  {format(book.volumeInfo.publishedDate, "yyyy")}
                </span>
              </div>
            </div>

            <Separator orientation="horizontal" decorative />

            {/* Description */}
            <span className="text-xs text-muted-foreground">
              {book.volumeInfo.description}
            </span>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button variant="destructive" onClick={() => removeFromCart(book)}>
              Remove from cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
}
