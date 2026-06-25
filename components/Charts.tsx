import { cn } from "@/lib/utils";
import { Participant } from "@/types/cred";
import { ChartData, Month } from "@/types/data";
import { differenceInDays } from "date-fns";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
} from "recharts";
import TextTicker from "./TextTicker";
import { Badge } from "./ui/badge";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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
  const chartData = getCheckoutsOverTime(participants);
  const chartConfig = {
    value: {
      label: "Checkouts",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  return (
    <Card className="w-2/3 card">
      <CardHeader className="card-header">
        <CardTitle>Checkouts over time</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          The number of checked out books over time.
          {/* Up by 5.2% this month <TrendingUp className="size-4" /> */}
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

export function CheckoutsByPurpose({
  participants,
  isLoading,
  error,
}: ChartComponentProps) {
  const chartData = getCheckoutsByPurpose(participants);
  const chartConfig = {
    checkouts: { label: "Checkouts" },
    self: {
      label: "Myself",
      color: "var(--chart-1)",
    },
    children: {
      label: "Child(ren)",
      color: "var(--chart-2)",
    },
    family: {
      label: "Family",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  const totalCheckouts = useMemo(() => {
    return chartData.reduce((acc, datum) => acc + datum.value, 0);
  }, [chartData]);

  return (
    <Card className="w-1/3 card">
      <CardHeader className="card-header">
        <CardTitle>Checkouts by purpose</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          Who is reading our books.
          {/* Up by 5.2% this month <TrendingUp className="size-4" /> */}
        </CardDescription>
      </CardHeader>

      <CardContent className="chart-card-content">
        {isLoading || error ? (
          <SkeletonChart isLoading={isLoading} error={error} />
        ) : (
          <ChartContainer config={chartConfig} className="chart-container">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                innerRadius={50}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalCheckouts.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Checkouts
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function MostReadGenres({
  participants,
  isLoading,
  error,
}: ChartComponentProps) {
  const chartData = getMostReadGenres(participants);
  const chartConfig = {
    value: {
      label: "Count",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full card">
      <CardHeader className="card-header">
        <CardTitle>Most read genres</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          {/* Up by 5.2% this month <TrendingUp className="size-4" /> */}
          What we are reading.
        </CardDescription>
      </CardHeader>

      <CardContent className="chart-card-content">
        {isLoading || error ? (
          <SkeletonChart isLoading={isLoading} error={error} />
        ) : (
          <ChartContainer config={chartConfig} className="chart-container">
            <RadarChart data={chartData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
    </Card>
  );
}

// TODO: A stacked bar chart where the total is the number of participants,
// and each category where participants primarily read their book.
export function ReadingPaceDistribution({
  participants,
  isLoading,
  error,
}: ChartComponentProps) {
  const chartData = getReadingPaceDistribution(participants);
  const chartConfig = {
    value: {
      label: "Count",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-1/3 card">
      <CardHeader className="card-header">
        <CardTitle>Reading pace distribution</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          How long it takes.
          {/* Up by 5.2% this month <TrendingUp className="size-4" /> */}
        </CardDescription>
      </CardHeader>

      <CardContent className="chart-card-content">
        {isLoading || error ? (
          <SkeletonChart isLoading={isLoading} error={error} />
        ) : (
          <ChartContainer config={chartConfig} className="chart-container">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                // tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-primary)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// Disable SSR safely for window-dependent component modules
const LiquidGauge = dynamic(() => import("@/components/LiquidGauge"), {
  ssr: false,
});

export function PageGauge({
  participants,
  isLoading,
  error,
}: ChartComponentProps) {
  return (
    <Card className="w-full h-1/2 relative overflow-hidden">
      <CardContent className="flex justify-center items-center p-6">
        {isLoading || error ? (
          <SkeletonChart isLoading={isLoading} error={error} />
        ) : (
          <LiquidGauge value={50} caption="500/1,000 pages read" />
        )}
      </CardContent>
    </Card>
  );
}

export function KpiCard({
  value,
  labelSingular,
  labelPlural,
  className,
}: {
  value: number;
  labelSingular: string;
  labelPlural: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-center items-center gap-0",
        className,
      )}
    >
      <TextTicker value={value} />
      <span className="w-full text-center card-text line-clamp-1 text-sm">
        {value === 1 ? labelSingular : labelPlural}
      </span>
    </Card>
  );
}

export function TopReaders({
  participants,
  isLoading,
  error,
}: ChartComponentProps) {
  const data = getTopReaders(participants);
  return (
    <Card className="w-1/4 h-full">
      <CardHeader>
        <CardTitle>Top readers</CardTitle>
        <CardDescription className="flex items-center gap-2 leading-none font-medium">
          {/* Up by 5.2% this month <TrendingUp className="size-4" /> */}
          Who's really reading.
        </CardDescription>
      </CardHeader>

      <CardContent className="">
        {isLoading || error ? (
          <SkeletonChart isLoading={isLoading} error={error} />
        ) : (
          data && (
            <Table>
              <TableCaption className="text-xs">
                {data.length > 1 && `The top ${data.length} readers.`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-xs text-center">
                    #
                  </TableHead>
                  <TableHead className="text-xs w-full">Participant</TableHead>
                  <TableHead className="text-xs text-center">Site</TableHead>
                  <TableHead className="text-xs text-center">Books</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((participant, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-xs text-center">
                      {i + 1}
                    </TableCell>
                    <TableCell className="text-xs line-clamp-1">
                      {participant.first_name} {participant.last_name[0]}.
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge>{participant.site.nickname}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      {participant.checkout_history?.length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </CardContent>
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

function getCheckoutsOverTime(participants: Participant[] | null): ChartData {
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

function getCheckoutsByPurpose(participants: Participant[] | null): ChartData {
  const chartDataMap = new Map<string, number>();

  if (!participants)
    return Array.from(chartDataMap.entries()).map(
      ([checkoutPurpose, count], i) => ({
        label: checkoutPurpose,
        value: count,
        fill: `var(--chart-${i + 1})`,
      }),
    );

  // Only include checkouts from participants with a checkout history,
  // and flatten the checkout histories into a single array.
  const filteredCheckoutHistory = participants.flatMap(
    (p) => p.checkout_history || [],
  );

  for (const item of filteredCheckoutHistory) {
    const { checkout_purpose } = item;
    if (!checkout_purpose) continue;
    chartDataMap.set(
      checkout_purpose,
      (chartDataMap.get(checkout_purpose) || 0) + 1,
    );
  }

  const result = Array.from(chartDataMap.entries()).map(
    ([checkoutPurpose, count], i) => ({
      label: checkoutPurpose,
      value: count,
      fill: `var(--chart-${i * 2 + 1})`,
    }),
  );
  return result;
}

function getMostReadGenres(participants: Participant[] | null): ChartData {
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

function getReadingPaceDistribution(
  participants: Participant[] | null,
): ChartData {
  const chartDataMap = new Map<string, number>([
    ["0-7", 0],
    ["8-14", 0],
    ["15-30", 0],
    ["30+", 0],
  ]);

  if (!participants)
    return Array.from(chartDataMap.entries()).map(([label, value]) => ({
      label,
      value,
    }));

  // Only include checkouts from participants with a checkout history,
  // and flatten the checkout histories into a single array.
  const filteredCheckoutHistory = participants.flatMap(
    (p) => p.checkout_history || [],
  );

  for (const item of filteredCheckoutHistory) {
    const { checkout_date, return_date } = item;
    if (!checkout_date || !return_date) continue;
    const diffInDays: number = differenceInDays(return_date, checkout_date);

    let group: string;

    switch (true) {
      case diffInDays >= 0 && diffInDays <= 7:
        group = "0-7";
        break;
      case diffInDays > 7 && diffInDays <= 14:
        group = "8-14";
        break;
      case diffInDays > 14 && diffInDays <= 30:
        group = "15-30";
        break;
      default:
        group = "30+";
        break;
    }

    chartDataMap.set(group, (chartDataMap.get(group) || 0) + 1);
  }

  const result = Array.from(chartDataMap.entries()).map(
    ([checkoutPurpose, count], i) => ({
      label: checkoutPurpose,
      value: count,
      fill: "var(--chart-3)",
    }),
  );
  return result;
}

function getTopReaders(
  participants: Participant[] | null,
): Participant[] | null {
  if (!participants) return null;

  const filteredAndSortedParticipants = participants
    .map((participant) => ({
      ...participant,
      checkout_history:
        participant.checkout_history?.filter(
          (item) => item.return_date !== null,
        ) ?? [],
    }))
    .filter((participant) => participant.checkout_history.length > 0);

  return filteredAndSortedParticipants
    .sort((a, b) => {
      const historyA = a.checkout_history;
      const historyB = b.checkout_history;

      // Primary sort: completed checkouts (all remaining items have return dates)
      if (historyA.length !== historyB.length) {
        return historyB.length - historyA.length;
      }

      // Tie-breaker: alphabetical
      const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
      const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();

      return nameA.localeCompare(nameB);
    })
    .slice(0, 20);
}

export function getReaderMetrics(participants: Participant[] | null) {
  let activeReaders = 0,
    bookReports = 0,
    booksRead = 0;

  if (!participants) return { activeReaders, bookReports, booksRead };

  // Only include checkouts from participants with a checkout history,
  // and flatten the checkout histories into a single array.
  const filteredCheckoutHistory = participants.flatMap(
    (p) => p.checkout_history || [],
  );

  // The number of checkouts with return dates.
  booksRead = filteredCheckoutHistory.filter(
    (checkout) => checkout.return_date,
  ).length;

  // The number of participants with a checkout history.
  activeReaders = participants.filter(
    (participant) => participant.checkout_history,
  ).length;

  // The number of book reports completed.
  bookReports = filteredCheckoutHistory.filter(
    (checkout) => checkout.has_completed_book_report,
  ).length;

  return { activeReaders, bookReports, booksRead };
}
