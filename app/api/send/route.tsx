import { CheckoutEmail, ReturnEmail } from "@/components/EmailTemplates";
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
    books,
    emailType,
    participant,
    ccRecipients,
  }: {
    books: CheckoutItem[];
    emailType: string;
    participant: Participant;
    ccRecipients: string[] | undefined;
  } = body;

  if (!participant)
    return NextResponse.json(
      { error: "Missing participant." },
      { status: 400 },
    );

  if (!books || !Array.isArray(books) || books.length === 0)
    return NextResponse.json(
      { error: "Missing or invalid books." },
      { status: 400 },
    );

  try {
    if (emailType === "checkout") {
      const { data, error } = await resend.emails.send({
        from: "Chicago CRED Library<notifications@creducation.app>",
        cc: ccRecipients,
        bcc: ["CRED Education Team<crededucation@chicagocred.com>"],
        to: participant.email,
        subject: "Your library checkout receipt 📚",
        react: <CheckoutEmail books={books} participant={participant} />,
        replyTo: "CRED Education Team<crededucation@chicagocred.com>",
      });

      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }

      return NextResponse.json(data);
    } else if (emailType === "return") {
      const { data, error } = await resend.emails.send({
        from: "Chicago CRED Library<notifications@creducation.app>",
        cc: ccRecipients,
        bcc: ["CRED Education Team<crededucation@chicagocred.com>"],
        to: participant.email,
        subject: "Your library return receipt 📚",
        react: <ReturnEmail books={books} participant={participant} />,
        replyTo: "CRED Education Team<crededucation@chicagocred.com>",
      });

      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
