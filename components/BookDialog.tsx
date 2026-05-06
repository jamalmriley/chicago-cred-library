"use client";

import {
  Dialog,
  DialogClose,
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
          <DialogHeader>
            <DialogTitle className="font-bold line-clamp-1">
              {data.items[0].volumeInfo.title}
            </DialogTitle>
            <DialogDescription className="italic line-clamp-2">
              {data.items[0].volumeInfo.authors.join(", ")}
            </DialogDescription>
          </DialogHeader>
          {data &&
            data.items.map((item) => (
              <div key={item.id} className="flex gap-5">
                <Image
                  src={item.volumeInfo.imageLinks.thumbnail.replace(
                    "http://",
                    "https://",
                  )}
                  alt={item.volumeInfo.title}
                  width={200}
                  height={300}
                  className="w-1/3 min-w-1/3 border rounded-sm aspect-auto"
                />
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <span>
                    <span className="font-bold">
                      Genre{item.volumeInfo.categories?.length !== 1 ? "s" : ""}
                      :{" "}
                    </span>{" "}
                    {item.volumeInfo.categories?.join(", ")}
                  </span>
                  <span>
                    <span className="font-bold">Pages: </span>{" "}
                    {item.volumeInfo.pageCount}
                    {" | "}
                    <span className="font-bold">Points: </span>{" "}
                    {Math.round(item.volumeInfo.pageCount * 0.5)}
                  </span>
                  <span>
                    <span className="font-bold">Published Date: </span>{" "}
                    {item.volumeInfo.publishedDate}
                  </span>
                  <Separator />
                  <div className="relative">
                    <span
                      className={`ease-in-out transition-all duration-500 block ${
                        isExpanded
                          ? "max-h-32 overflow-y-scroll"
                          : "max-h-16 overflow-hidden"
                      }`}
                    >
                      {item.volumeInfo.description}
                    </span>

                    {/* Fade overlay — only visible when collapsed */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-popover to-transparent transition-opacity duration-500 ${
                        isExpanded
                          ? "opacity-0 pointer-events-none"
                          : "opacity-100"
                      }`}
                    />
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-muted-foreground w-fit m-0 p-0"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? "See less" : "See more"}
                  </Button>
                </div>
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
