import { sendGoToSms } from "@/lib/goto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { ownerPhoneNumber, contactPhoneNumbers, body } =
      await request.json();
    await sendGoToSms(ownerPhoneNumber, contactPhoneNumbers, body);
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
