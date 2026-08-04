import { Participant } from "@/types/cred";
import { CheckoutItem } from "@/types/library";
import { format } from "date-fns";
import { CheckoutBookLineItem } from "./BookLineItem";

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
        your checked out books.
      </p>
      <div className="w-80 h-full flex flex-col gap-3 overflow-y-scroll scrollbar-none">
        {cart.map((item, index) => (
          <CheckoutBookLineItem key={index} book={item.book} index={index} />
        ))}
      </div>
      <p>
        {cart.length === 1 ? "This book" : "These books"} are due{" "}
        {format(dueDate, "eeee, MMMM d, yyyy")}.
      </p>
    </div>
  );
}
