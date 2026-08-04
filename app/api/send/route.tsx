import { CheckoutReceipt } from "@/components/EmailTemplates";
import { Participant } from "@/types/cred";
import { CheckoutItem } from "@/types/library";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

export async function POST(request: NextRequest) {
  if (!apiKey)
    return NextResponse.json(
      { error: "Missing Resend API Key." },
      { status: 400 },
    );

  const body = await request.json();
  const {
    cart,
    dueDate,
    participant,
  }: { cart: CheckoutItem[]; dueDate: string; participant: Participant } = body;

  if (!participant)
    return NextResponse.json(
      { error: "Missing participant." },
      { status: 400 },
    );

  if (!cart || !Array.isArray(cart) || cart.length === 0)
    return NextResponse.json(
      { error: "Missing or invalid cart." },
      { status: 400 },
    );

  try {
    const { data, error } = await resend.emails.send({
      from: "Chicago CRED Library<notifications@creducation.app>",
      cc: ["CRED Education Team<crededucation@chicagocred.com>"],
      to: "jamal@chicagocred.com", // TODO: After testing, change to participant.email
      subject: "Your library receipt 📚",
      react: (
        <CheckoutReceipt
          cart={cart}
          dueDate={dueDate}
          participant={participant}
        />
      ),
      replyTo: "Jamal Riley<jamal@chicagocred.com>",
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
