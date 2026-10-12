import { ManualBook } from "@/types/library";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI();

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      authors,
      publishedDate,
      isbn,
      description,
      category,
      pageCount,
    } = await req.json();

    if (!title && !isbn) {
      return NextResponse.json(
        { error: "Title or ISBN is required" },
        { status: 400 },
      );
    }

    // Call the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Given the following details about a book, fill in the missing information and provide a complete description:\n\nTitle: ${title}\nAuthors: ${authors.join(", ")}\nPublished Date: ${publishedDate}\nISBN: ${isbn}\nDescription: ${description}\nCategory: ${category}\nPage Count: ${pageCount}\n\nReturn the response in JSON format with the following fields: title (string), authors (array of strings), publishedDate (Date), industryIdentifiers (array of objects where type is "ISBN_10" or "ISBN_13" and identifier is a string that is 10, 12, or 13 characters long), description (string), categories (array of strings that splits the "category" variable by commas), pageCount (number). Only return the JSON object without any additional text or explanation.`,
    });

    return NextResponse.json(
      {
        data: {
          volumeInfo: JSON.parse(response.text ?? "{}"),
        } as ManualBook,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
