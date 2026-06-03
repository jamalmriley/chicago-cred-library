import { GoogleBooks } from "@/types/library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn)
    return NextResponse.json({ error: "Missing ISBN." }, { status: 400 });

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.GOOGLE_BOOKS_API_KEY}`,
  );
  const data: GoogleBooks.SuccessResponse = await res.json();

  if (!data.items)
    return NextResponse.json({ error: "Book not found." }, { status: 404 });

  return NextResponse.json(data.items[0]);
}
