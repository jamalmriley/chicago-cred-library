import { GoogleBooks } from "@/types/library";
import { clsx, type ClassValue } from "clsx";
import { Metadata } from "next";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createPageTitle(
  title?: string,
  description?: string,
): Metadata {
  return {
    title: title ? `${title} | CRED Library` : "CRED Library",
    description:
      description || "A literacy initiative powered by Chicago CRED.",
  };
}

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
