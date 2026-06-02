import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useKioskContext } from "@/contexts/kiosk-context";
import { Participant } from "@/types/cred";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import KioskCard from "./KioskCard";

const filterParticipantsBySelectedLetter = (
  participants: Participant[],
  selectedLetter: string,
) => {
  return participants.filter((participant) =>
    participant.first_name.startsWith(selectedLetter),
  );
};

export default function ParticipantSelect() {
  const {
    participant,
    participants,
    setParticipants,
    participantsError,
    setParticipantsError,
    participantsLoading,
    setParticipantsLoading,
    setMaxCheckoutStepAllowed,
  } = useKioskContext();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const [birthday, setBirthday] = useState<string>("");
  const [birthdayDesc, setBirthdayDesc] = useState<string>("");
  const alphabet: string[][] = [
    "ABCDEFGHIJ".split(""),
    "KLMNOPQRST".split(""),
    "UVWXYZ".split(""),
  ];
  const [currStep, nextStep] = [1, 2];

  const hasNameThatStartWithSelectedLetter = (
    participants: Participant[],
    selectedLetter: string,
  ) => {
    return participants.some((participant) =>
      participant.first_name.startsWith(selectedLetter),
    );
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      await setParticipantsLoading(true);
      const res = await fetch("/api/participants");

      if (!res.ok) {
        setParticipantsLoading(false);
        setParticipants(null);
        setParticipantsError("There was an error loading participants.");
        console.error(await res.json());
        return;
      }

      const data: Participant[] = await res.json();
      setParticipantsLoading(false);
      setParticipants(data);
      setParticipantsError(null);
    };

    fetchParticipants();
  }, []);

  useEffect(() => {
    const fetchParticipantBirthday = async () => {
      const isValidBirthday = (birthday: string): boolean => {
        const validChars = {
          char1: ["0", "1"], // Months can only start with a 0 or 1.
          char3: ["0", "1", "2", "3"], // Dates can only start with numbers 0-3.
        };

        if (birthday.length !== 4) return false;
        const charArr = birthday.split("");
        const [char1, char2, char3, char4] = [
          charArr[0],
          charArr[1],
          charArr[2],
          charArr[3],
        ];

        return (
          validChars.char1.includes(char1) &&
          char1 + char2 !== "00" &&
          validChars.char3.includes(char3) &&
          char3 + char4 !== "00"
        );
      };

      if (!participant || birthday.length < 4) {
        setBirthdayDesc("");
        setMaxCheckoutStepAllowed(currStep);
        return;
      }

      if (!isValidBirthday(birthday)) {
        setBirthdayDesc("Please enter a valid birthday.");
        setMaxCheckoutStepAllowed(currStep);
        return;
      }

      setBirthdayDesc("Verifying birthday...");
      const res = await fetch(`/api/participants?id=${participant.id}`);

      if (!res.ok) {
        setMaxCheckoutStepAllowed(currStep);
        setParticipantsError(
          "There was an error verifying your birthday. Please refresh and try again.",
        );
        // console.error(await res.json());
        return;
      }

      const data: Participant = await res.json();
      const isBirthdayCorrect: boolean = data.birthday === birthday;
      setMaxCheckoutStepAllowed(isBirthdayCorrect ? nextStep : currStep);
      setBirthdayDesc(
        isBirthdayCorrect
          ? "Birthday verified!"
          : "Birthday incorrect. Please try again.",
      );
    };

    fetchParticipantBirthday();
  }, [birthday, participant]);

  return (
    <KioskCard title="What's your name?">
      {/* Participants List */}
      {participantsLoading ? (
        <div className="w-60 h-full min-h-0 flex flex-col gap-5 overflow-y-scroll">
          {Array.from({ length: 26 }).map((_, i) => (
            <SkeletonParticipantList key={i} />
          ))}
        </div>
      ) : participants ? (
        <div className="w-60 h-full min-h-0 flex flex-col gap-5 overflow-y-scroll">
          {selectedLetter ? (
            <FilteredParticipantList letter={selectedLetter} />
          ) : (
            alphabet
              .flat()
              .map(
                (letter, i) =>
                  hasNameThatStartWithSelectedLetter(participants, letter) && (
                    <FilteredParticipantList key={i} letter={letter} />
                  ),
              )
          )}
        </div>
      ) : (
        <div className="w-60 h-full min-h-0 flex flex-col justify-center items-center gap-5">
          <CircleX className="text-destructive size-20" />
          <span className="text-muted-foreground text-center">
            {participantsError}
          </span>
        </div>
      )}

      <Separator orientation="vertical" decorative className="mx-5" />

      {/* Buttons and Birthday */}
      <div className="w-108 h-full flex flex-col items-center gap-10">
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
                  disabled={
                    participants
                      ? !hasNameThatStartWithSelectedLetter(
                          participants,
                          letter,
                        )
                      : true
                  }
                >
                  {letter}
                </Button>
              ))}
              {i === alphabet.length - 1 && (
                <Button
                  variant="outline"
                  className="flex grow"
                  onClick={() => setSelectedLetter(null)}
                  disabled={!Boolean(participants)}
                >
                  Clear
                </Button>
              )}
            </span>
          ))}
        </div>

        <Field className="w-fit">
          <FieldLabel
            htmlFor="birthday"
            className={`font-bold ${!Boolean(participant) ? "text-muted-foreground" : "text-primary-foreground"}`}
          >
            Please verify your birthday to continue.
          </FieldLabel>
          <InputOTP
            id="birthday"
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            value={birthday}
            onChange={(value) => setBirthday(value)}
            required
            disabled={!Boolean(participant)}
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
          <FieldDescription>{birthdayDesc}</FieldDescription>
        </Field>
      </div>
    </KioskCard>
  );
}

function FilteredParticipantList({ letter }: { letter: string }) {
  const {
    participant,
    setParticipant,
    participants,
    setMaxCheckoutStepAllowed,
  } = useKioskContext();
  return (
    <div className="w-full flex flex-col gap-2">
      <span className="select-none text-xs font-bold">{letter}</span>
      {participants &&
        filterParticipantsBySelectedLetter(participants, letter).map(
          (p: Participant) => (
            <Button
              key={p.id}
              variant={participant === p ? "default" : "outline"}
              className={`w-full text-left line-clamp-1 border ${participant === p ? "border-primary" : ""}`}
              onClick={() => {
                if (participant) {
                  setParticipant(null);
                  setMaxCheckoutStepAllowed(1);
                } else setParticipant(p);
              }}
            >
              {p.first_name} {p.last_name}
            </Button>
          ),
        )}
    </div>
  );
}

function SkeletonParticipantList() {
  return (
    <div className="w-full flex flex-col gap-2">
      <Skeleton className="size-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="w-full h-9" />
      ))}
    </div>
  );
}
