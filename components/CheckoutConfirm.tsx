import { Button } from "@/components/ui/button";
import { useKioskContext } from "@/contexts/kiosk-context";
import { Participant } from "@/types/cred";
import { format } from "date-fns";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
import KioskCard from "./KioskCard";

export default function CheckoutConfirm({
  participant,
  returnDate,
}: {
  participant: Participant;
  returnDate: Date;
}) {
  const { cart } = useKioskContext();
  return (
    <KioskCard title={`You're all set, ${participant.first_name}.`}>
      <div className="flex flex-col items-center gap-5">
        <CircleCheckBig className="size-20 text-green-400" />
        <span>
          <h2 className="h2">
            We hope you enjoy your book{cart.length === 1 ? "" : "s"}!
          </h2>
          <p className="text-muted-foreground">
            {cart.length === 1 ? "It's" : "They're"} due back in 2 weeks, on{" "}
            {format(returnDate, "eeee, MMMM d, yyyy")}.
          </p>
        </span>
        <Button asChild>
          <Link href="/kiosk">Done</Link>
        </Button>
      </div>
    </KioskCard>
  );
}
