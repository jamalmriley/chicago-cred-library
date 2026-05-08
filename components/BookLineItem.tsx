import { VolumeInfo } from "@/types/books";
import BookDialog from "./BookDialog";
import Image from "next/image";

export default function BookLineItem({ book }: { book: VolumeInfo }) {
  const isbn = book.industryIdentifiers?.[0].identifier || "";
  return (
    <div className="w-full h-24 flex items-center gap-3 border rounded-xl p-3">
      <Image
        src={book.imageLinks?.thumbnail.replace("http://", "https://") || ""}
        alt={book.title}
        width={96}
        height={96}
        className="h-full w-auto aspect-square object-cover rounded-sm shadow-sm" // Crops thumbnail to square
      />
      <div className="flex flex-col gap-1">
        <p className="text-md font-semibold leading-none line-clamp-1">
          {book.title}
        </p>
        <p className="text-xs italic text-muted-foreground line-clamp-1">
          {book.authors?.join(", ")}
        </p>
      </div>

      <span className="ml-auto">
        <BookDialog isbn={isbn} />
      </span>
    </div>
  );
}
