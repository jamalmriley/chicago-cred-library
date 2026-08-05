import { toBookDisplayInfo } from "@/lib/utils";
import { Participant } from "@/types/cred";
import { CheckoutItem } from "@/types/library";
import { format } from "date-fns";
import { BookMarked } from "lucide-react";

interface EmailTemplateProps {
  cart: CheckoutItem[];
  dueDate: string;
  participant: Participant;
}

export function CheckoutReceipt({
  cart,
  dueDate,
  participant,
}: EmailTemplateProps) {
  return (
    <div>
      <h1>Your library receipt 📚</h1>
      <p>Hi, {participant.first_name}!</p>
      <p>
        Thanks for visiting the Chicago CRED Library. Below is a receipt for
        your checked out {cart.length === 1 ? "book" : "books"}.
      </p>
      <div className="w-80 h-full flex flex-col gap-3 overflow-y-scroll scrollbar-none">
        {cart.map((item, index) => (
          <div key={index} className="w-full flex items-center gap-3">
            {toBookDisplayInfo(item.book).thumbnail ? (
              <div className="relative min-h-16 min-w-16 aspect-square shrink-0 rounded-sm shadow-sm overflow-hidden">
                <img
                  src={toBookDisplayInfo(item.book).thumbnail ?? ""}
                  alt={toBookDisplayInfo(item.book).title}
                  className="object-cover"
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
        {format(dueDate, "eeee, MMMM d, yyyy")}.
      </p>
    </div>
  );
}
