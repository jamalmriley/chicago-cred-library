import { getValidGoToToken } from "@/app/kiosk/layout";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { ownerPhoneNumber, contactPhoneNumbers, body } =
      await request.json();

    const accessToken = await getValidGoToToken();
    if (!accessToken) return;

    const res = await fetch("https://api.goto.com/messaging/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ownerPhoneNumber,
        contactPhoneNumbers,
        body,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json({ success: false, error: errorData });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Catch when tokens are absent or token rotation has broken/revoked
    if (error.message === "GOTO_AUTH_REQUIRED") {
      return NextResponse.json(
        { error: "Authentication required", requiresAuth: true },
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
