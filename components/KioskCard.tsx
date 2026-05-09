import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
  // Vertical padding: 5rem (p-10)
  // Bottom navigation height: 2.5rem (h-10)
  // Bottom navigation margin: 2.5rem (mb-10)
  // Total: 10rem
  return (
    <div className="size-full p-10 flex items-center justify-center">
      <Card
        className={cn(
          `h-[calc(100dvh-10rem)] min-h-[calc(100dvh-10rem)] p-0`,
          className,
        )}
      >
        <CardTitle className="px-10 pt-5">{title}</CardTitle>
        <CardContent
          className={cn(
            `size-full min-h-0 flex flex-${flex} flex-1 grow items-center justify-center px-10 pb-10`,
          )}
        >
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
