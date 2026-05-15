import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SUBTRACTED_HEIGHT } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function KioskCard({
  title,
  flex = "row",
  children,
  className,
}: {
  title: string;
  flex?: "row" | "col";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      // className={`w-full h-[calc(100dvh-${SUBTRACTED_HEIGHT}rem)] p-10 flex justify-center items-center`}
      className={`w-full h-[calc(100dvh-4.75rem)] p-10 flex justify-center items-center`}
    >
      <Card className={cn("w-fit h-full p-0", className)}>
        <CardTitle className="px-10 pt-5">{title}</CardTitle>
        <CardContent
          className={`h-full min-h-0 flex flex-${flex} items-center justify-center px-10 pb-10`}
        >
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
