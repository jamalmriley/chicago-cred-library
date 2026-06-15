import { Participant } from "@/types/cred";
import { ChartData, Month } from "@/types/data";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
} from "recharts";
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

interface ChartComponentProps {
  participants: Participant[] | null;
  isLoading: boolean;
  error: string | null;
}

export function CheckoutsOverTime({
  participants,
  isLoading,
  error,
}: ChartComponentProps) {
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
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          Up by 5.2% this month <TrendingUp className="size-4" />
        </CardDescription>
      </CardHeader>

      <CardContent className="chart-card-content">
        {isLoading || error ? (
          <SkeletonChart isLoading={isLoading} error={error} />
        ) : (
          <ChartContainer config={chartConfig} className="chart-container">
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
                dataKey="label"
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
    <Card className="w-1/3">
      <CardHeader>
        <CardTitle>Checkouts by purpose</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          Up by 5.2% this month <TrendingUp className="size-4" />
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function MostReadGenres({
  participants,
  isLoading,
  error,
}: ChartComponentProps) {
  const chartData = findMostReadGenrea(participants);
  const chartConfig = {
    value: {
      label: "Count",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-1/3">
      <CardHeader>
        <CardTitle>Most read genres</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          Up by 5.2% this month <TrendingUp className="size-4" />
        </CardDescription>

        <CardContent className="">
          {isLoading || error ? (
            <SkeletonChart isLoading={isLoading} error={error} />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="chart-container aspect-square"
            >
              <RadarChart data={chartData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarAngleAxis dataKey="label" />
                <PolarGrid />
                <Radar
                  dataKey="value"
                  fill="var(--color-primary)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ChartContainer>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
}

export function ReadingPaceDistribution() {
  return (
    <Card className="w-1/3">
      <CardHeader>
        <CardTitle>Reading pace distribution</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          Up by 5.2% this month <TrendingUp className="size-4" />
        </CardDescription>
      </CardHeader>
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
      label: month,
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
    label: month,
    value,
  }));
}

function findMostReadGenrea(participants: Participant[] | null): ChartData {
  const chartDataMap = new Map<string, number>();

  if (!participants)
    return Array.from(chartDataMap.entries()).map(([genre, count]) => ({
      label: genre,
      value: count,
    }));

  // Only include checkouts from participants with a checkout history,
  // and flatten the checkout histories into a single array.
  const filteredCheckoutHistory = participants.flatMap(
    (p) => p.checkout_history || [],
  );

  for (const item of filteredCheckoutHistory) {
    const genres = item.book.book_info.volumeInfo.categories;
    for (const genre of genres) {
      chartDataMap.set(genre, (chartDataMap.get(genre) || 0) + 1);
    }
  }

  return Array.from(chartDataMap.entries()).map(([genre, count]) => ({
    label: genre,
    value: count,
  }));
}
