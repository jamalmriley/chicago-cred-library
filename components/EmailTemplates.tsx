import { toBookDisplayInfo } from "@/lib/utils";
import { Participant } from "@/types/cred";
import { CheckoutItem } from "@/types/library";
import { Html, Preview, Tailwind } from "@react-email/components";
import { format } from "date-fns";
import { BookMarked } from "lucide-react";

interface EmailTemplateProps {
  cart: CheckoutItem[];
  participant: Participant;
}

export function CheckoutReceipt({ cart, participant }: EmailTemplateProps) {
  return (
    <Html lang="en">
      <Preview>
        We hope you enjoy your {cart.length === 1 ? "book" : "books"}!
      </Preview>
      <Tailwind>
        <div>
          <p>Hi, {participant.first_name}!</p>
          <p>
            Thanks for visiting the Chicago CRED Library. Below is a receipt for
            your checked out {cart.length === 1 ? "book" : "books"}.
          </p>

          <p className="text-muted-foreground font-semibold">
            Your {cart.length === 1 ? "book" : "books"}
          </p>
          <div className="flex flex-col gap-3">
            {cart.map((item, index) => (
              <div key={index} className="w-full flex items-center gap-3">
                {toBookDisplayInfo(item.book).thumbnail ? (
                  <div className="relative size-16 aspect-square shrink-0 rounded-sm shadow-sm overflow-hidden">
                    <img
                      src={toBookDisplayInfo(item.book).thumbnail ?? ""}
                      alt={toBookDisplayInfo(item.book).title}
                      className="object-cover"
                      width={64}
                      height={64}
                    />
                  </div>
                ) : (
                  <span className="min-h-16 min-w-16 aspect-square shrink-0 bg-secondary/25 flex justify-center items-center rounded-sm shadow-sm">
                    <BookMarked className="size-full p-3 text-muted-foreground" />
                  </span>
                )}
                {/* Title and Authors */}
                <div className="flex flex-col gap-1">
                  <p className="text-md font-semibold line-clamp-1">
                    {toBookDisplayInfo(item.book).title}
                  </p>
                  <p className="text-xs italic text-muted-foreground line-clamp-1">
                    {toBookDisplayInfo(item.book).authors?.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p>
            {cart.length === 1 ? "This book is" : "These books are"} due{" "}
            <span className="font-bold">
              {format(cart[0].due_date, "eeee, MMMM d, yyyy")}
            </span>
            . If you have any questions, please reply to this email or reach out
            to your tutor.
          </p>
        </div>
      </Tailwind>
    </Html>
  );
}
