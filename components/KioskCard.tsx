import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function KioskCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // Vertical padding: 5rem (p-10)
  // Bottom navigation height: 2.5rem (h-10)
  // Bottom navigation margin: 2.5rem (mb-10)
  // Total: 10rem
  const paddingAndNavHeight = 10;
  return (
    <div className="p-10 flex items-center justify-center">
      {/* 8rem is the sum of the padding and height of the carousel indicators */}
      <Card
        className={`w-3/4 h-[calc(100dvh-${paddingAndNavHeight}rem)] min-h-[calc(100dvh-${paddingAndNavHeight}rem)] p-0`}
      >
        <CardTitle className="px-10 pt-5">{title}</CardTitle>
        <CardContent className="size-full flex flex-1 grow items-center justify-center px-10 pb-10">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
