import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";

export default function BookLineItem() {
  return (
    <div className="w-full flex items-center gap-3 border border-border rounded-xl p-3">
      <Skeleton className="w-20 aspect-square shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="text-md font-semibold leading-none">Example Book</p>
        <p className="text-xs text-muted-foreground">Example Author</p>
      </div>

      <div className="flex flex-col items-end ml-auto">
        <p className="text-md font-semibold leading-none">0</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>

      <Button size="icon" variant="ghost" className="rounded-full">
        <EllipsisVertical />
      </Button>
    </div>
  );
}
