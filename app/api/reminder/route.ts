export const dynamic = "force-dynamic";

import { ReminderEmail } from "@/components/EmailTemplates";
import { sendGotoSms } from "@/lib/goto";
import { supabase } from "@/lib/supabase";
import { Participant, Site } from "@/types/cred";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

export async function GET() {
  if (!apiKey)
    return NextResponse.json(
      { error: "Missing Resend API Key." },
      { status: 400 },
    );

  const today = new Date();
  const { data: sites } = await supabase().from("sites").select<"*", Site>();
  const { data: participants } = await supabase()
    .from("participants")
    .select<"*", Participant>();

  let sent = 0;
  if (!participants || !sites) return NextResponse.json({ sent });

  for (const participant of participants) {
    if (!participant.checkout_history) continue;

    // Find the site settings for this participant's site
    const site = sites.find((site) => site.id === participant.siteId);
    const ccRecipients = site?.settings?.email_notification_recipients;
    const reminders = site?.settings?.reminders ?? {};

    for (const [daysUntilReminder, reminderTypes] of Object.entries(
      reminders,
    )) {
      const unreturnedBooks = participant.checkout_history
        .filter((item) => item && item.due_date)
        .filter((item) => {
          const dueDate = new Date(String(item.due_date));
          const daysUntilDue = Math.ceil(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24), // ms * sec * min * hour
          );
          const isTimeToRemind = daysUntilDue === Number(daysUntilReminder);

          return !item.is_returned && isTimeToRemind;
        });

      const canSendEmail = reminderTypes.includes("email");
      const canSendText = reminderTypes.includes("text");

      const reminderSubject = `Your ${unreturnedBooks.length === 1 ? "book is" : "books are"} due ${daysUntilReminder === "0" ? "tomorrow" : daysUntilReminder === "1" ? "tomorrow" : `in ${daysUntilReminder} days`}`;

      if (canSendEmail) {
        try {
          const { data, error } = await resend.emails.send({
            from: "Chicago CRED Library<notifications@creducation.app>",
            cc: ccRecipients,
            bcc: ["CRED Education Team<crededucation@chicagocred.com>"],
            to: participant.email,
            subject: `Reminder: ${reminderSubject} 📚`,
            react: ReminderEmail({ books: unreturnedBooks, participant }),
            replyTo: "CRED Education Team<crededucation@chicagocred.com>",
          });

          if (data) {
            sent++;
          } else if (error) {
            return NextResponse.json({ error }, { status: 500 });
          }
        } catch (error) {
          console.error("Error sending email:", error);
          return NextResponse.json({ error }, { status: 500 });
        }
      }
      if (canSendText) {
        const message = `CRED Library: As a reminder, ${reminderSubject.toLowerCase()}. If you have any questions, you can reply to this text.`;
        const fromPhoneNumber = site?.from_phone_number ?? "+17732348917";
        await sendGotoSms(fromPhoneNumber, [participant.phone], message);
        await sendGotoSms(fromPhoneNumber, ["+17736290679"], message);
        sent++;
      }
    }
  }

  return NextResponse.json({ sent });
}
