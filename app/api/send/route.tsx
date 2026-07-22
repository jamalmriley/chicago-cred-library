import { CheckoutReceipt } from "@/components/EmailTemplates";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

export async function POST() {
  if (!apiKey)
    return NextResponse.json(
      { error: "Missing Resend API Key." },
      { status: 400 },
    );

  try {
    const { data, error } = await resend.emails.send({
      from: "Chicago CRED Library<notifications@creducation.app>",
      cc: ["Jamal Riley<jamal@chicagocred.com>"], // Vijay Ramkissoon<vijay@chicagocred.com>
      to: ["jamal.m.riley@gmail.com"],
      subject: "Your library receipt 📚",
      react: <CheckoutReceipt firstName="Jamal" />,
      replyTo: "Jamal Riley<jamal@chicagocred.com>",
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
