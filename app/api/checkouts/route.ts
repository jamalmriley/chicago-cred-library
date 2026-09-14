import { supabase } from "@/lib/supabase";
import { Participant } from "@/types/cred";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site");

  const query = supabase().from("participants").select<"*", Participant>();

  // Only filter by site if one was provided.
  // Otherwise, return all checkouts.
  const { data, error } = site
    ? await query.eq("siteId", site).not("checkout_history", "is", null)
    : await query.not("checkout_history", "is", null);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
