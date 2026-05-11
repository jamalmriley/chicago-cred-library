"use client";

import { Item } from "@/types/books";
import { Participant } from "@/types/user";
import { createContext, useContext, useState } from "react";

type CheckoutContext = {
  participant: Participant | null;
  setParticipant: React.Dispatch<React.SetStateAction<Participant | null>>;
  participants: Participant[] | null;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[] | null>>;
  participantsError: string | null;
  setParticipantsError: React.Dispatch<React.SetStateAction<string | null>>;
  participantsLoading: boolean;
  setParticipantsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currBook: Item | null;
  setCurrBook: React.Dispatch<React.SetStateAction<Item | null>>;
  cart: Item[];
  setCart: React.Dispatch<React.SetStateAction<Item[]>>;
  maxCheckoutStepAllowed: number;
  setMaxCheckoutStepAllowed: React.Dispatch<React.SetStateAction<number>>;
};

export const CheckoutContext = createContext<CheckoutContext | null>(null);

export default function CheckoutContextProvider({
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
  const [currBook, setCurrBook] = useState<Item | null>(null);
  const [cart, setCart] = useState<Item[]>([]);
  const [maxCheckoutStepAllowed, setMaxCheckoutStepAllowed] =
    useState<number>(1);
  return (
    <CheckoutContext.Provider
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
        maxCheckoutStepAllowed,
        setMaxCheckoutStepAllowed,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error(
      "useCheckoutContext must be used within a CheckoutContextProvider.",
    );
  }
  return context;
}
