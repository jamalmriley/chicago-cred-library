import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin") ?? "admin"; // "kiosk" or "admin"
  console.log("/ Origin:", origin);

  const params = new URLSearchParams({
    client_id: process.env.GOTO_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.GOTO_REDIRECT_URI!,
    scope: "messaging.v1.send",
    state: origin, // carry origin through OAuth
  });

  return Response.redirect(
    `https://authentication.logmeininc.com/oauth/authorize?${params}`,
  );
}
