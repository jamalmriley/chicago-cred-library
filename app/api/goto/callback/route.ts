import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Handle user declining
  const error = searchParams.get("error");
  if (error) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?goto=declined`,
    );
  }

  const code = searchParams.get("code");
  if (!code) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?goto=error`,
    );
  }

  // Exchange code for tokens
  const tokenRes = await fetch(
    "https://authentication.logmeininc.com/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.GOTO_REDIRECT_URI!,
        client_id: process.env.GOTO_CLIENT_ID!,
        client_secret: process.env.GOTO_CLIENT_SECRET!,
      }),
    },
  );
  const { access_token, refresh_token, expires_in } = await tokenRes.json();

  // Save to cookies

  // 1. Calculate explicit absolute timestamp for expiration
  const expiresAt = Date.now() + expires_in * 1000;

  // 2. Initialize cookie storage and determine environment
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // 3. Set cookies with HttpOnly flags for security
  cookieStore.set("goto_access_token", access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: expires_in, // Automatically discards cookie when access token dies
  });

  cookieStore.set("goto_expires_at", expiresAt.toString(), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  });

  cookieStore.set("goto_refresh_token", refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // Long-lived window for refresh access
  });

  return Response.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?goto=connected`,
  );
}
