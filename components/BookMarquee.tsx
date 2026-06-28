import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { LibraryBook } from "@/types/library";
import { ImageOff } from "lucide-react";
import Image from "next/image";

function BookCard({ book }: { book: LibraryBook }) {
  const { volumeInfo } = book.book_info;
  return (
    <span className="w-48 min-w-48 flex flex-col gap-5">
      {volumeInfo.imageLinks ? (
        <Image
          src={volumeInfo.imageLinks.thumbnail.replace("http://", "https://")}
          alt={book.book_info.volumeInfo.title}
          width={200}
          height={200}
          className="w-full h-auto aspect-auto shrink-0 rounded-lg border hover:scale-105 hover:shadow-lg transform transition-all ease-in-out duration-200" // Maintains thumbnail aspect ratio
        />
      ) : (
        <div className="w-full aspect-3/4 flex justify-center items-center rounded-lg border bg-muted text-muted-foreground font-bold text-3xl hover:scale-105 hover:shadow-lg transform transition-all ease-in-out duration-200">
          <ImageOff className="size-16" />
        </div>
      )}
    </span>
  );
}

export default function Marquee3D({
  books,
  className,
}: {
  books: LibraryBook[];
  className?: string;
}) {
  function splitBooksEvenly(divisor: number) {
    const baseSize = Math.floor(books.length / divisor);
    const remainder = books.length % divisor;

    const result = [];
    let start = 0;

    for (let i = 0; i < divisor; i++) {
      // Add 1 to the chunk size for the first 'remainder' chunks
      const end = start + baseSize + (i < remainder ? 1 : 0);
      result.push(books.slice(start, end));
      start = end;
    }

    return result;
  }

  return (
    <div
      className={cn("relative flex h-full w-full overflow-hidden", className)}
    >
      {/* 3D Marquee */}
      <div className="flex h-full w-full flex-row items-center justify-center gap-4 [perspective:300px]">
        <div
          className="flex flex-row items-center gap-4"
          style={{
            transform:
              "translateX(-200px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
          }}
        >
          {splitBooksEvenly(8)
            .filter((col) => col !== null)
            .map((col, i) => (
              <Marquee
                key={i}
                pauseOnHover
                vertical
                reverse={i % 2 === 0}
                className={`[--duration:60s] flex-1`}
              >
                {col
                  .filter((book) => book.book_info.volumeInfo.imageLinks)
                  .map((book, i) => (
                    <BookCard key={i} book={book} />
                  ))}
              </Marquee>
            ))}
        </div>
      </div>

      {/* Gradients */}
      <div className="from-background/85 pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b" />
      <div className="from-background/85 pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t" />
      <div className="from-background/85 pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r" />
      <div className="from-background/85 pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l" />
    </div>
  );
}
