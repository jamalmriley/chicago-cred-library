import { Participant } from "@/types/user";
import KioskCard from "./KioskCard";
import { format } from "date-fns";
import { CircleCheckBig } from "lucide-react";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutConfirm({
  participant,
}: {
  participant: Participant;
}) {
  const { cart } = useCheckoutContext();
  const d = new Date();
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
            {format(d, "eeee, MMMM d, yyyy")}.
          </p>
        </span>
        <Button asChild>
          <Link href="/">Done</Link>
        </Button>
      </div>
    </KioskCard>
  );
}
