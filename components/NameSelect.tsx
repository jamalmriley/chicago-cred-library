import { useState } from "react";
import KioskCard from "./KioskCard";
import { Button } from "./ui/button";

export default function NameSelect() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const alphabetLine1: string[] = "ABCDEFGHIJKLM".split("");
  const alphabetLine2: string[] = "NOPQRSTUVWXYZ".split("");
  return (
    <KioskCard title="What's your name?">
      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {alphabetLine1.map((letter, idx) => (
            <Button
              key={idx}
              size="icon"
              variant={selectedLetter === letter ? "default" : "outline"}
              className="rounded-md"
              onClick={() =>
                setSelectedLetter((lttr) => (lttr === letter ? null : letter))
              }
            >
              {letter}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {alphabetLine2.map((letter, idx) => (
            <Button
              key={idx}
              size="icon"
              variant={selectedLetter === letter ? "default" : "outline"}
              className="rounded-md"
              onClick={() =>
                setSelectedLetter((lttr) => (lttr === letter ? null : letter))
              }
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>
    </KioskCard>
  );
}
