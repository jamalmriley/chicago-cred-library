import BookDialog from "./BookDialog";
import KioskCard from "./KioskCard";
import { Separator } from "@/components/ui/separator";
import BookLineItem from "./BookLineItem";

export default function BookScan({ name }: { name: string }) {
  return (
    <KioskCard title={`Start scanning, ${name}.`}>
      <div className="w-1/2 h-full flex flex-col gap-3 overflow-y-hidden">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <BookLineItem key={i} />
          ))}
      </div>
      <Separator orientation="vertical" decorative className="mx-5" />
      <div className="w-1/2 h-full">
        Book details
        <BookDialog />
      </div>
    </KioskCard>
  );
}
