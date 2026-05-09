import { Button } from "@/components/ui/button";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { test_participants } from "@/data";
import { Participant } from "@/types/user";
import { useState } from "react";
import KioskCard from "./KioskCard";

const filterParticipantsBySelectedLetter = (selectedLetter: string) => {
  return test_participants.filter((participant) =>
    participant.first_name.startsWith(selectedLetter),
  );
};

export default function NameSelect() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const alphabet: string[][] = [
    "ABCDEFGHIJKLM".split(""),
    "NOPQRSTUVWXYZ".split(""),
  ];

  const hasNameThatStartWithSelectedLetter = (selectedLetter: string) => {
    for (const participant of test_participants) {
      if (participant.first_name.startsWith(selectedLetter)) {
        return true;
      }
    }
    return false;
  };

  return (
    <KioskCard title="What's your name?" flex="col">
      {/* Buttons */}
      {/* TODO: Add a search bar powered by Algolia */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex flex-col gap-2">
          {alphabet.map((line, i) => (
            <span key={i} className="flex gap-2">
              {line.map((letter, j) => (
                <Button
                  key={j}
                  size="icon"
                  variant={selectedLetter === letter ? "default" : "outline"}
                  className="rounded-md"
                  onClick={() =>
                    setSelectedLetter((lttr) =>
                      lttr === letter ? null : letter,
                    )
                  }
                  disabled={!hasNameThatStartWithSelectedLetter(letter)}
                >
                  {letter}
                </Button>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Participants List */}
      <div className="size-full min-h-0 flex flex-col gap-5 overflow-y-scroll">
        {selectedLetter ? (
          <FilteredParticipantList letter={selectedLetter} />
        ) : (
          alphabet
            .flat()
            .map(
              (letter, i) =>
                hasNameThatStartWithSelectedLetter(letter) && (
                  <FilteredParticipantList key={i} letter={letter} />
                ),
            )
        )}
      </div>
    </KioskCard>
  );
}

function FilteredParticipantList({ letter }: { letter: string }) {
  const { participant, setParticipant } = useCheckoutContext();
  return (
    <div className="flex flex-col gap-2">
      <span className="select-none text-xs font-bold">{letter}</span>
      {filterParticipantsBySelectedLetter(letter).map((p: Participant) => (
        <Button
          key={p.id}
          variant={participant === p ? "default" : "outline"}
          className="w-full justify-start rounded-sm"
          onClick={() => setParticipant((prev) => (prev === p ? null : p))}
        >
          {p.first_name} {p.last_name}
        </Button>
      ))}
    </div>
  );
}
