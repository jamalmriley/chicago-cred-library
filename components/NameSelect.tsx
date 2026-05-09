import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { test_participants } from "@/data";
import { Participant } from "@/types/user";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import KioskCard from "./KioskCard";
import { Field, FieldLabel } from "@/components/ui/field";

const filterParticipantsBySelectedLetter = (selectedLetter: string) => {
  return test_participants.filter((participant) =>
    participant.first_name.startsWith(selectedLetter),
  );
};

export default function NameSelect() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<string>("");
  const alphabet: string[][] = [
    "ABCDEFGHIJ".split(""),
    "KLMNOPQRST".split(""),
    "UVWXYZ".split(""),
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
    <KioskCard title="What's your name?">
      {/* Participants List */}
      <div className="w-60 h-full min-h-0 flex flex-col gap-5 overflow-y-scroll">
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

      <Separator orientation="vertical" decorative className="mx-5" />

      {/* Buttons and Birthday */}
      {/* TODO: Add a search bar powered by Algolia */}
      <div className="h-full flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          {alphabet.map((line, i) => (
            <span key={i} className="flex gap-2">
              {line.map((letter, j) => (
                <Button
                  key={j}
                  size="icon"
                  variant={selectedLetter === letter ? "default" : "outline"}
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
              {i === alphabet.length - 1 && (
                <Button
                  variant="outline"
                  className="flex grow"
                  onClick={() => setSelectedLetter(null)}
                >
                  Clear
                </Button>
              )}
            </span>
          ))}
        </div>

        <Field className="w-fit">
          <FieldLabel htmlFor="birthday">
            Please verify your birthday to continue.
          </FieldLabel>
          <InputOTP
            id="birthday"
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            value={birthday}
            onChange={(value) => setBirthday(value)}
            required
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-16 text-3xl font-bold" />
              <InputOTPSlot index={1} className="size-16 text-3xl font-bold" />
            </InputOTPGroup>
            <span className="text-3xl text-muted-foreground mx-2">/</span>
            <InputOTPGroup>
              <InputOTPSlot index={2} className="size-16 text-3xl font-bold" />
              <InputOTPSlot index={3} className="size-16 text-3xl font-bold" />
            </InputOTPGroup>
          </InputOTP>
        </Field>
      </div>
    </KioskCard>
  );
}

function FilteredParticipantList({ letter }: { letter: string }) {
  const { participant, setParticipant } = useCheckoutContext();
  return (
    <div className="w-full flex flex-col gap-2">
      <span className="select-none text-xs font-bold">{letter}</span>
      {filterParticipantsBySelectedLetter(letter).map((p: Participant) => (
        <Button
          key={p.id}
          variant={participant === p ? "default" : "outline"}
          className={`w-full text-left line-clamp-1 ${participant === p ? "border-primary" : ""}`}
          onClick={() => setParticipant((prev) => (prev === p ? null : p))}
        >
          {p.first_name} {p.last_name}
        </Button>
      ))}
    </div>
  );
}
