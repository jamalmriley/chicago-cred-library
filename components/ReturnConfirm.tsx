import { useKioskContext } from "@/contexts/kiosk-context";
import { Participant } from "@/types/cred";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
import KioskCard from "./KioskCard";
import { Button } from "./ui/button";

export default function ReturnConfirm({
  participant,
}: {
  participant: Participant;
}) {
  const { returns } = useKioskContext();
  const completedBookReportCount = returns.filter(
    (item) => item.has_completed_book_report,
  ).length;
  const hasCompletedBookReport = completedBookReportCount > 0;
  return (
    <KioskCard flex="row" title={`You're all set, ${participant.first_name}.`}>
      <div className="flex flex-col items-center gap-5">
        {/* TODO: Add "points earned" display */}
        <CircleCheckBig className="size-20 text-green-400" />
        <span>
          <h2 className="h2">
            We hope you enjoyed your book{returns.length === 1 ? "" : "s"}!
          </h2>
          <p
            className={`text-muted-foreground ${hasCompletedBookReport ? "" : "text-center"}`}
          >
            Place your book{returns.length === 1 ? "" : "s"} in the book return
            bin
            {hasCompletedBookReport
              ? `, and don't forget hand your book report${completedBookReportCount === 1 ? "" : "s"} to your tutor or life coach to earn extra points`
              : ""}
            .
          </p>
        </span>
        <Button asChild>
          <Link href="/kiosk">Done</Link>
        </Button>
      </div>
    </KioskCard>
  );
}
