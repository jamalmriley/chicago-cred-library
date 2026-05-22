import { supabase } from "@/lib/supabase";
import { Participant } from "@/types/cred";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const query = supabase().from("participants").select<"*", Participant>();

  // Only filter by ID if an ID was provided.
  // Otherwise, return all participants.
  const { data, error } = id ? await query.eq("id", id).single() : await query;

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json(
      { error: "Missing participant ID." },
      { status: 400 },
    );

  const body = await request.json();

  const { data, error } = await supabase()
    .from("participants")
    .update(body)
    .eq("id", id)
    .select<"*", Participant>()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
