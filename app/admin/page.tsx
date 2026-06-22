"use client";

import {
  CheckoutsByPurpose,
  CheckoutsOverTime,
  getReaderMetrics,
  KpiCard,
  MostReadGenres,
  PageGauge,
  ReadingPaceDistribution,
  TopReaders,
} from "@/components/Charts";
import { useParticipants } from "@/hooks/use-participants";

export default function AdminPage() {
  const { participants, participantsLoading, participantsError } =
    useParticipants();
  const { activeReaders, booksRead } = getReaderMetrics(participants);

  return (
    // 92px is the height of the sidebar trigger.
    <div className="w-full h-[calc(100dvh-92px)] flex flex-col">
      <h1 className="h1">Dashboard</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        View reading activity and metrics.
      </p>
      {/* Cards */}
      <div className="size-full flex gap-5 min-h-0">
        <div className="w-3/4 h-full flex flex-col gap-5">
          <div className="w-full h-1/2 flex gap-5 min-h-0">
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
          <div className="w-full h-1/2 flex gap-5 min-h-0">
            <div className="w-2/3 h-full flex gap-5">
              <MostReadGenres
                participants={participants}
                isLoading={participantsLoading}
                error={participantsError}
              />

              {/* KPI Cards */}
              <div className="w-full h-full flex flex-col gap-5  min-h-0">
                <PageGauge
                  participants={participants}
                  isLoading={participantsLoading}
                  error={participantsError}
                />

                <div className="w-full h-1/2 flex gap-5 min-h-0">
                  <KpiCard
                    value={activeReaders}
                    labelSingular="reader"
                    labelPlural="readers"
                    className="w-1/2 h-full"
                  />

                  <KpiCard
                    value={booksRead}
                    labelSingular="book read"
                    labelPlural="books read"
                    className="w-1/2 h-full"
                  />
                </div>
              </div>
            </div>

            <ReadingPaceDistribution
              participants={participants}
              isLoading={participantsLoading}
              error={participantsError}
            />
          </div>
        </div>
        <TopReaders
          participants={participants}
          isLoading={participantsLoading}
          error={participantsError}
        />
      </div>
    </div>
  );
}
