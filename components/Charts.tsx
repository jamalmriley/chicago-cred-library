import { Participant } from "@/types/cred";
import { ChartData, Month } from "@/types/data";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";
import { Skeleton } from "./ui/skeleton";

export function CheckoutsOverTime({
  participants,
  isLoading,
  error,
}: {
  participants: Participant[] | null;
  isLoading: boolean;
  error: string | null;
}) {
  const chartData = convertToChartData(participants);
  const chartConfig = {
    value: {
      label: "Checkouts",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  return (
    <Card className="w-2/3">
      <CardHeader>
        <CardTitle>Checkouts over time</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading || error ? (
          <SkeletonChart isLoading={isLoading} error={error} />
        ) : (
          <ChartContainer config={chartConfig} className="min-h-48 w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="value"
                type="linear"
                fill="var(--color-primary)"
                fillOpacity={0.4}
                stroke="var(--color-primary)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function CheckoutsByPurpose() {
  return (
    <Card className="w-1/3 p-6">
      <p className="font-semibold">Checkouts by purpose</p>
    </Card>
  );
}

export function MostReadGenres() {
  return (
    <Card className="w-1/3 p-6">
      <p className="font-semibold">Most read genres</p>
    </Card>
  );
}

export function ReadingPaceDistribution() {
  return (
    <Card className="w-1/3 p-6">
      <p className="font-semibold">Reading pace distribution</p>
    </Card>
  );
}

function SkeletonChart({
  isLoading,
  error,
}: {
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div
      className={`size-full flex items-center justify-center p-6 ${error ? "bg-destructive/5" : "bg-muted"} rounded-lg`}
    >
      {isLoading ? (
        <Skeleton className="size-full" />
      ) : error ? (
        <p className="text-destructive">Error: {error}</p>
      ) : null}
    </div>
  );
}

function convertToChartData(participants: Participant[] | null): ChartData {
  const chartDataMap = new Map<Month, number>([
    ["January", 0],
    ["February", 0],
    ["March", 0],
    ["April", 0],
    ["May", 0],
    ["June", 0],
    ["July", 0],
    ["August", 0],
    ["September", 0],
    ["October", 0],
    ["November", 0],
    ["December", 0],
  ]);

  if (!participants)
    return Array.from(chartDataMap.entries()).map(([month, value]) => ({
      month,
      value,
    }));

  // Only include checkouts from participants with a checkout history,
  // and flatten the checkout histories into a single array.
  const filteredCheckoutHistory = participants.flatMap(
    (p) => p.checkout_history || [],
  );

  for (const item of filteredCheckoutHistory) {
    const month = new Date(item.checkout_date).toLocaleString("default", {
      month: "long",
    }) as Month;
    chartDataMap.set(month, (chartDataMap.get(month) || 0) + 1);
  }

  return Array.from(chartDataMap.entries()).map(([month, value]) => ({
    month,
    value,
  }));
}
