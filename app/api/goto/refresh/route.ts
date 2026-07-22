import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("goto_refresh_token")?.value;

    if (!refreshToken) throw new Error("GOTO_AUTH_REQUIRED");

    // The token is missing or dead; trigger a silent refresh.
    const response = await fetch(
      "https://authentication.logmeininc.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.GOTO_CLIENT_ID!,
          client_secret: process.env.GOTO_CLIENT_SECRET!,
        }),
      },
    );

    if (!response.ok) throw new Error("GOTO_AUTH_REQUIRED");

    const newTokens = await response.json();
    const nextExpiresAt = Date.now() + newTokens.expires_in * 1000;
    const isProduction = process.env.NODE_ENV === "production";

    // Re-save rotated updates
    cookieStore.set("goto_access_token", newTokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: newTokens.expires_in,
    });
    cookieStore.set("goto_expires_at", nextExpiresAt.toString(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    if (newTokens.refresh_token) {
      cookieStore.set("goto_refresh_token", newTokens.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Catch when tokens are absent or token rotation has broken/revoked
    if (error.message === "GOTO_AUTH_REQUIRED") {
      return NextResponse.json(
        { error: "GoTo authentication required.", requiresAuth: true },
        { status: 401 },
      );
    }

    console.error("SMS failed to send:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
