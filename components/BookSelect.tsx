import { useAdminContext } from "@/contexts/admin-context";
import { LibraryBook } from "@/types/library";
import { BookX, ImageOff, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const filterBooksBySelectedLetter = (
  books: LibraryBook[],
  selectedLetter: string,
) => {
  if (selectedLetter === "#")
    return books.filter((book) =>
      Number.isInteger(parseInt(getSortableTitle(book)[0])),
    );
  return books.filter((book) =>
    getSortableTitle(book).startsWith(selectedLetter),
  );
};

const hasBookThatStartWithSelectedLetter = (
  books: LibraryBook[],
  selectedLetter: string,
) => {
  if (selectedLetter === "#")
    return books
      ? books.some((book) =>
          Number.isInteger(parseInt(getSortableTitle(book)[0])),
        )
      : false;
  return books
    ? books.some((book) => getSortableTitle(book).startsWith(selectedLetter))
    : false;
};

const getSortableTitle = (book: LibraryBook) => {
  const rawTitle = book.book_info.volumeInfo.title;

  // 1. Normalize accents (e.g., "Crónica" becomes "Cronica")
  const noAccents = rawTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Clean whitespace and uppercase
  const cleanTitle = noAccents.trim().toUpperCase();

  // 3. Match uppercase Spanish and English articles
  const articleRegex = /^(THE|A|AN|EL|LA|LOS|LAS|UN|UNA|UNOS|UNAS)\s+/;

  // 4. Strip the article if it exists
  return cleanTitle.replace(articleRegex, "");
};

export default function BookSelect() {
  const {
    books,
    setBooks,
    booksError,
    setBooksError,
    booksLoading,
    setBooksLoading,
    lastUpdated,
    setLastUpdated,
  } = useAdminContext();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

  const refresh = () => setLastUpdated(new Date().toString());

  useEffect(() => {
    const fetchBooks = async () => {
      await setBooksLoading(true);
      const res = await fetch("/api/library");

      if (!res.ok) {
        setBooksLoading(false);
        setBooks(null);
        setBooksError("There was an error loading books.");
        console.error(await res.json());
        return;
      }

      const data: LibraryBook[] = await res.json();
      setBooksLoading(false);
      setBooks(data);
      setBooksError(null);
    };

    fetchBooks();
  }, [lastUpdated]);

  return (
    <div className="size-full flex flex-col gap-5">
      {/* Buttons */}
      <span className="w-full flex gap-2 justify-center">
        {alphabet.map((letter) => (
          <Button
            key={letter}
            size="icon-xs"
            variant={selectedLetter === letter ? "default" : "outline"}
            onClick={() =>
              setSelectedLetter((lttr) => (lttr === letter ? null : letter))
            }
            disabled={
              books ? !hasBookThatStartWithSelectedLetter(books, letter) : true
            }
          >
            {letter}
          </Button>
        ))}
      </span>

      <div className="w-full overflow-x-hidden">
        {booksLoading ? (
          <div className="size-full flex flex-col gap-5">
            {Array.from({ length: 26 }).map((_, i) => (
              <SkeletonBookList key={i} />
            ))}
          </div>
        ) : books ? (
          <div className="size-full flex flex-col gap-5">
            {selectedLetter ? (
              <FilteredBookList letter={selectedLetter} />
            ) : (
              alphabet
                .flat()
                .map(
                  (letter, i) =>
                    hasBookThatStartWithSelectedLetter(books, letter) && (
                      <FilteredBookList key={i} letter={letter} />
                    ),
                )
            )}
          </div>
        ) : (
          <div className="w-full h-fit flex flex-col flex-1 grow justify-center items-center p-10 border rounded-xl border-destructive bg-destructive/5 text-destructive">
            <BookX className="size-20" />
            <p className="text-lg font-medium mb-5 select-none">{booksError}</p>
            <Button onClick={refresh}>
              <RotateCcw />
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilteredBookList({ letter }: { letter: string }) {
  const { books } = useAdminContext();
  return (
    <div className="w-full flex flex-col gap-2">
      <span className="select-none text-xs font-bold">{letter}</span>
      <div className="flex gap-5 overflow-x-scroll scrollbar-none">
        {books &&
          filterBooksBySelectedLetter(books, letter).map(
            (book: LibraryBook) => <BookItem key={book.id} book={book} />,
          )}
      </div>
    </div>
  );
}

function BookItem({ book }: { book: LibraryBook }) {
  const { volumeInfo } = book.book_info;
  return (
    <span className="w-40 min-w-40 flex flex-col gap-5">
      {volumeInfo.imageLinks ? (
        <Image
          src={volumeInfo.imageLinks.thumbnail.replace("http://", "https://")}
          alt={book.book_info.volumeInfo.title}
          width={200}
          height={200}
          className="w-full h-auto aspect-auto shrink-0 rounded-lg border" // Maintains thumbnail aspect ratio
        />
      ) : (
        <div className="w-full aspect-3/4 flex justify-center items-center rounded-lg border bg-muted text-muted-foreground font-bold text-3xl">
          <ImageOff className="size-16" />
        </div>
      )}
      <span>
        <p className="font-bold line-clamp-1">{volumeInfo.title}</p>
        <p className="text-sm line-clamp-1">{volumeInfo.authors.join(", ")}</p>
        <p className="text-xs text-muted-foreground">
          {book.total_count} {book.total_count === 1 ? " copy" : " copies"} |{" "}
          {book.site.nickname}
        </p>
      </span>
    </span>
  );
}

function SkeletonBookList() {
  return (
    <div className="w-full flex flex-col gap-2">
      <Skeleton className="size-4" />
      <div className="flex gap-5 overflow-x-scroll scrollbar-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="w-40 min-w-40 flex flex-col gap-5">
            <Skeleton className="w-full aspect-3/4 rounded-lg border" />
            <span className="flex flex-col">
              <Skeleton className="w-full h-5 mb-1" />
              <Skeleton className="w-full h-4 mb-1" />
              <Skeleton className="w-full h-3 mb-1" />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
