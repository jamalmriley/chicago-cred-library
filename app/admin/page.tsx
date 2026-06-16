"use client";

import {
  CheckoutsByPurpose,
  CheckoutsOverTime,
  getReaderMetrics,
  KpiCard,
  MostReadGenres,
  ReadingPaceDistribution,
} from "@/components/Charts";
import TextTicker from "@/components/TextTicker";
import { Card } from "@/components/ui/card";
import { useParticipants } from "@/hooks/use-participants";

export default function AdminPage() {
  const { participants, participantsLoading, participantsError } =
    useParticipants();
  const { activeReaders, bookReports, booksRead } =
    getReaderMetrics(participants);

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
            <CheckoutsByPurpose
              participants={participants}
              isLoading={participantsLoading}
              error={participantsError}
            />
          </div>
          <div className="w-full h-1/2 flex gap-5">
            <MostReadGenres
              participants={participants}
              isLoading={participantsLoading}
              error={participantsError}
            />
            <div className="w-1/3 h-full flex flex-col gap-5">
              <KpiCard
                value={booksRead}
                labelSingular="book read"
                labelPlural="books read"
                className="w-full h-1/2"
              />

              <div className="w-full h-1/2 flex gap-5">
                <KpiCard
                  value={activeReaders}
                  labelSingular="reader"
                  labelPlural="readers"
                  className="w-1/2 h-full"
                />

                <KpiCard
                  value={bookReports}
                  labelSingular="book report"
                  labelPlural="book reports"
                  className="w-1/2 h-full"
                />
              </div>
            </div>
            <ReadingPaceDistribution />
          </div>
        </div>
        <Card className="w-1/4 h-full p-6">
          <span className="card-text">Top readers</span>
        </Card>
      </div>
    </div>
  );
}
