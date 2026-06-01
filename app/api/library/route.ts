import { supabase } from "@/lib/supabase";
import { LibraryBook } from "@/types/library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const query = supabase().from("library").select<"*", LibraryBook>();

  // Only filter by ID if one was provided.
  // Otherwise, return all books.
  const { data, error } = id ? await query.eq("id", id).single() : await query;

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID." }, { status: 400 });

  const body = await request.json();

  const { data, error } = await supabase()
    .from("library")
    .update(body)
    .eq("id", id)
    .select<"*", LibraryBook>()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase()
    .from("library")
    .insert([body])
    .select<"*", LibraryBook>();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
