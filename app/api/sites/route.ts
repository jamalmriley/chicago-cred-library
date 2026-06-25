import { supabase } from "@/lib/supabase";
import { Site } from "@/types/cred";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase()
    .from("sites")
    .insert([body])
    .select<"*", Site>();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const query = supabase().from("sites").select<"*", Site>();

  // Only filter by ID if one was provided.
  // Otherwise, return all sites.
  const { data, error } = id ? await query.eq("id", id).single() : await query;

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "Missing site ID." }, { status: 400 });

  const body = await request.json();

  const { data, error } = await supabase()
    .from("sites")
    .update(body)
    .eq("id", id)
    .select<"*", Site>()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "Missing site ID." }, { status: 400 });

  const { data, error } = await supabase()
    .from("sites")
    .delete()
    .eq("id", id)
    .select<"*", Site>()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
