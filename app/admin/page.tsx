import { Card } from "@/components/ui/card";

export default function AdminPage() {
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
            <Card className="w-2/3 p-6">
              <p className="font-semibold">Checkouts over time</p>
            </Card>
            <Card className="w-1/3 p-6">
              <p className="font-semibold">Checkouts by purpose</p>
            </Card>
          </div>
          <div className="w-full h-1/2 flex gap-5">
            <Card className="w-1/3 p-6">
              <p className="font-semibold">Most read genres</p>
            </Card>
            <Card className="w-2/3 p-6">
              <p className="font-semibold">Reading pace distribution</p>
            </Card>
          </div>
        </div>
        <Card className="w-1/4 h-full p-6">
          <p className="font-semibold">Top readers</p>
        </Card>
      </div>
    </div>
  );
}
