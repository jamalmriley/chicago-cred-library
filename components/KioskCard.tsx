import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function KioskCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-10 flex items-center justify-center">
      {/* 8rem is the sum of the padding and height of the carousel indicators */}
      <Card
        className={`w-3/4 h-[calc(100dvh-8rem)] min-h-[calc(100dvh-8rem)] p-0`}
      >
        <CardTitle className="px-10 pt-5">{title}</CardTitle>
        <CardContent className="size-full flex flex-1 grow items-center justify-center px-10 pb-10">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
