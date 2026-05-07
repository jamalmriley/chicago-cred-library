"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { GoogleBooksResponse } from "@/types";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { EllipsisVertical } from "lucide-react";
import { format } from "date-fns";

export default function BookDialog({ isbn }: { isbn: string }) {
  const [data, setData] = useState<GoogleBooksResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
    )
      .then((res) => res.json())
      .then((data: GoogleBooksResponse) => setData(data));
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-full">
          <EllipsisVertical />
        </Button>
      </DialogTrigger>
      {data && data.items.length > 0 && (
        <DialogContent className="w-1/2 min-w-137.5">
          {data &&
            data.items.map((item, i) => (
              <div key={i} className="flex flex-col gap-3">
                {/* Book Image and Details */}
                <div className="flex gap-5">
                  <Image
                    src={item.volumeInfo.imageLinks.thumbnail.replace(
                      "http://",
                      "https://",
                    )}
                    alt={item.volumeInfo.title}
                    width={200}
                    height={200}
                    className="w-24 h-auto aspect-auto shrink-0 rounded-sm shadow-sm" // Maintains thumbnail aspect ratio
                  />
                  {/* Book Details */}
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <span className="text-base text-primary-foreground font-bold leading-none line-clamp-1">
                      {data.items[0].volumeInfo.title}
                    </span>
                    <span className="text-sm italic line-clamp-1">
                      {data.items[0].volumeInfo.authors.join(", ")}
                    </span>
                    {/* Categories */}
                    <span>
                      <span className="font-bold">
                        Genre
                        {item.volumeInfo.categories?.length !== 1 ? "s" : ""}
                        :{" "}
                      </span>{" "}
                      {item.volumeInfo.categories?.join(", ")}
                    </span>
                    {/* Page Count and Points */}
                    <span>
                      <span className="font-bold">Pages: </span>{" "}
                      {item.volumeInfo.pageCount}
                      {" | "}
                      <span className="font-bold">Points: </span>{" "}
                      {Math.round(item.volumeInfo.pageCount * 0.5)}
                    </span>
                    {/* Year Published */}
                    <span>
                      <span className="font-bold">Year Published: </span>{" "}
                      {format(item.volumeInfo.publishedDate, "yyyy")}
                    </span>
                  </div>
                </div>

                <Separator orientation="horizontal" decorative />

                {/* Description */}
                <span className="text-xs text-muted-foreground">
                  {item.volumeInfo.description}
                </span>
              </div>
            ))}

          <DialogFooter className="sm:justify-start">
            {/* TODO: Implement remove from cart functionality */}
            <Button variant="destructive">Remove from cart</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
