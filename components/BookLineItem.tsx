import { Skeleton } from "@/components/ui/skeleton";
import { VolumeInfo } from "@/types";
import BookDialog from "./BookDialog";
import Image from "next/image";

export default function BookLineItem({ book }: { book: VolumeInfo }) {
  const isbn = book.industryIdentifiers?.[0].identifier || "";
  return (
    <div className="w-full flex items-center gap-3 border rounded-xl p-3">
      <Image
        src={book.imageLinks?.thumbnail.replace("http://", "https://") || ""}
        alt={book.title}
        width={80}
        height={120}
        className="w-20 aspect-square shrink-0"
      />
      <div className="flex flex-col gap-1">
        <p className="text-md font-semibold leading-none">{book.title}</p>
        <p className="text-xs text-muted-foreground">
          {book.authors?.join(", ")}
        </p>
      </div>

      <div className="flex flex-col items-end ml-auto">
        <p className="text-md font-semibold leading-none">0</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>

      <BookDialog isbn={isbn} />
    </div>
  );
}
