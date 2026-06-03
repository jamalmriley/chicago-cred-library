import { Button } from "@/components/ui/button";
import { Participant } from "@/types/cred";
import { LibraryBig } from "lucide-react";
import Link from "next/link";
import { ReturnBookLineItem } from "./BookLineItem";
import KioskCard from "./KioskCard";

export default function BookReturn({
  participant,
}: {
  participant: Participant;
}) {
  const activeCheckoutHistory = participant.checkout_history
    ? participant.checkout_history.filter((item) => !item.is_returned)
    : null;

  return (
    <KioskCard flex="row" title={`Welcome back, ${participant.first_name}.`}>
      <div className="w-80 h-full flex flex-col items-center gap-3 overflow-y-hidden">
        {activeCheckoutHistory && activeCheckoutHistory.length > 0 && (
          <h2 className="text-lg text-muted-foreground font-bold text-center">
            Select the book
            {activeCheckoutHistory && activeCheckoutHistory.length === 1
              ? ""
              : "s"}{" "}
            you're returning.
          </h2>
        )}
        {activeCheckoutHistory && activeCheckoutHistory.length > 0 ? (
          activeCheckoutHistory.map((checkoutItem, index) => (
            <ReturnBookLineItem
              key={index}
              book={checkoutItem.book}
              kioskItem={checkoutItem}
              location="return"
            />
          ))
        ) : (
          <div className="w-full h-full flex flex-col flex-1 grow justify-center items-center border rounded-xl p-10 bg-muted text-muted-foreground">
            <LibraryBig className="size-20" />
            <p className="text-lg font-medium text-muted-foreground mb-5 select-none">
              No books checked out yet.
            </p>
            <Button asChild>
              <Link href="/kiosk">Go back</Link>
            </Button>
          </div>
        )}
      </div>
    </KioskCard>
  );
}
