"use client";

import { Participant } from "@/types/cred";
import { CheckoutItem, LibraryBook } from "@/types/library";
import { createContext, useContext, useState } from "react";

type KioskContext = {
  participant: Participant | null;
  setParticipant: React.Dispatch<React.SetStateAction<Participant | null>>;
  participants: Participant[] | null;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[] | null>>;
  participantsError: string | null;
  setParticipantsError: React.Dispatch<React.SetStateAction<string | null>>;
  participantsLoading: boolean;
  setParticipantsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currBook: LibraryBook | null;
  setCurrBook: React.Dispatch<React.SetStateAction<LibraryBook | null>>;
  cart: CheckoutItem[];
  setCart: React.Dispatch<React.SetStateAction<CheckoutItem[]>>;
  returns: CheckoutItem[];
  setReturns: React.Dispatch<React.SetStateAction<CheckoutItem[]>>;
  maxCheckoutStepAllowed: number;
  setMaxCheckoutStepAllowed: React.Dispatch<React.SetStateAction<number>>;
};

export const KioskContext = createContext<KioskContext | null>(null);

export default function KioskContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null,
  );
  const [participantsLoading, setParticipantsLoading] = useState<boolean>(true);
  const [currBook, setCurrBook] = useState<LibraryBook | null>(null);
  const [cart, setCart] = useState<CheckoutItem[]>([]);
  const [returns, setReturns] = useState<CheckoutItem[]>([]);
  const [maxCheckoutStepAllowed, setMaxCheckoutStepAllowed] =
    useState<number>(1);
  return (
    <KioskContext.Provider
      value={{
        participant,
        setParticipant,
        participants,
        setParticipants,
        participantsError,
        setParticipantsError,
        participantsLoading,
        setParticipantsLoading,
        currBook,
        setCurrBook,
        cart,
        setCart,
        returns,
        setReturns,
        maxCheckoutStepAllowed,
        setMaxCheckoutStepAllowed,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
}

export function useKioskContext() {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error(
      "useKioskContext must be used within a KioskContextProvider.",
    );
  }
  return context;
}
