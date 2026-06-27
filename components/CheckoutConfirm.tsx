"use client";

import { Button } from "@/components/ui/button";
import { useKioskContext } from "@/contexts/kiosk-context";
import { DurationOption, Participant } from "@/types/cred";
import { format } from "date-fns";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import KioskCard from "./KioskCard";

export default function CheckoutConfirm({
  participant,
  dueDate,
  returnWindow,
}: {
  participant: Participant;
  dueDate: Date;
  returnWindow: DurationOption | undefined;
}) {
  const { cart } = useKioskContext();
  const [site] = useQueryState("site");
  return (
    <Suspense>
      <KioskCard title={`You're all set, ${participant.first_name}.`}>
        <div className="flex flex-col items-center gap-5">
          <CircleCheckBig className="size-20 text-green-400" />
          <span>
            <h2 className="h2">
              We hope you enjoy your book{cart.length === 1 ? "" : "s"}!
            </h2>
            <p className="text-muted-foreground">
              {cart.length === 1 ? "It's" : "They're"} due back{" "}
              {returnWindow
                ? `in ${returnWindow}, on
              ${format(dueDate, "eeee, MMMM d, yyyy")}`
                : "soon"}
              .
            </p>
          </span>
          <Button asChild>
            <Link href={`/kiosk?site=${site}`}>Done</Link>
          </Button>
        </div>
      </KioskCard>
    </Suspense>
  );
}
