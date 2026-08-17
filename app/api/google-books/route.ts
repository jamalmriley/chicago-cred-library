import { GoogleBooks } from "@/types/library";
import { NextRequest, NextResponse } from "next/server";

// Helper function to sleep/wait
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(
  url: string,
  retries = 3,
  delayMs = 1000,
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, {
      // Prevents Next.js from caching a failed 503 response state
      cache: "no-store",
    });

    // If successful or client error (like 404), return immediately
    if (response.status !== 503) {
      return response;
    }

    // If it's a 503, wait exponentially and retry
    if (i < retries - 1) {
      await delay(delayMs * Math.pow(2, i) + Math.random() * 200);
    }
  }
  return fetch(url); // Final fallback attempt
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn)
    return NextResponse.json({ error: "Missing ISBN." }, { status: 400 });

  const targetUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=US&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
  try {
    const res = await fetchWithRetry(targetUrl);

    if (res.status === 503) {
      return NextResponse.json(
        {
          error: "Google Books is temporarily unavailable. Please try again.",
        },
        { status: 503 },
      );
    }

    const data: GoogleBooks.SuccessResponse = await res.json();

    console.log({
      isbn,
      status: res.status,
      ok: res.ok,
      data,
    });

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    return NextResponse.json(data.items[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an internal error fetching book data." },
      { status: 500 },
    );
  }
}
