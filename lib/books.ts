import { GoogleBooks, LibraryBook } from "@/types/library";
import { toast } from "sonner";

export async function fetchGoogleBook(
  isbn: string,
): Promise<GoogleBooks.Book | null> {
  try {
    const res = await fetch(`/api/google-books?isbn=${isbn}`);

    if (res.status === 404) {
      toast.error("Book not found. Please try again.", {
        position: "bottom-right",
      });
      return null;
    } else if (!res.ok) {
      toast.error(
        "An error occurred while gathering book info. Please try again.",
        { position: "bottom-right" },
      );
      return null;
    }

    return (await res.json()) as GoogleBooks.Book;
  } catch (err) {
    const error = err as GoogleBooks.ErrorResponse;
    toast.error(
      error?.error?.message ||
        "An error occurred while gathering book info. Please try again.",
      { position: "bottom-right" },
    );
    return null;
  }
}

export async function fetchLibraryBook(
  id: string,
): Promise<LibraryBook | null> {
  try {
    const res = await fetch(`/api/library?id=${id}`);

    if (res.status === 404) {
      toast.error(
        "This book wasn't found in your library. Please select another book or try again.",
        {
          position: "bottom-right",
        },
      );
      return null;
    }

    if (!res.ok) {
      toast.error(
        "An error occurred while gathering book info. Please try again.",
        {
          position: "bottom-right",
        },
      );
      return null;
    }

    return (await res.json()) as LibraryBook;
  } catch {
    toast.error(
      "An error occurred while gathering book info. Please try again.",
      {
        position: "bottom-right",
      },
    );
    return null;
  }
}
