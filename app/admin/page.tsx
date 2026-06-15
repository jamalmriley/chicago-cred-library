"use client";

import {
  CheckoutsByPurpose,
  CheckoutsOverTime,
  MostReadGenres,
  ReadingPaceDistribution,
} from "@/components/Charts";
import { Card } from "@/components/ui/card";
import { useParticipants } from "@/hooks/use-participants";

export default function AdminPage() {
  const { participants, participantsLoading, participantsError } =
    useParticipants();
  return (
    // 32px is the height of the sidebar trigger.
    <div className="w-full h-[calc(100%-32px)] flex flex-col">
      <h1 className="h1">Dashboard</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        View reading activity and metrics.
      </p>
      {/* Cards */}
      <div className="size-full flex gap-5">
        <div className="w-3/4 h-full flex flex-col gap-5">
          <div className="w-full h-1/2 flex gap-5">
            <CheckoutsOverTime
              participants={participants}
              isLoading={participantsLoading}
              error={participantsError}
            />
            <CheckoutsByPurpose />
          </div>
          <div className="w-full h-1/2 flex gap-5">
            <MostReadGenres
              participants={participants}
              isLoading={participantsLoading}
              error={participantsError}
            />
            <div className="w-1/3 h-full flex flex-col gap-5">
              <Card className="w-full h-1/2 p-6">
                <p className="font-semibold">Books read</p>
              </Card>
              <div className="w-full h-1/2 flex gap-5">
                <Card className="w-1/2 h-full p-6">
                  <p className="font-semibold">Number of readers</p>
                </Card>
                <Card className="w-1/2 h-full p-6">
                  <p className="font-semibold">Book reports</p>
                </Card>
              </div>
            </div>
            <ReadingPaceDistribution />
          </div>
        </div>
        <Card className="w-1/4 h-full p-6">
          <p className="font-semibold">Top readers</p>
        </Card>
      </div>
    </div>
  );
}
