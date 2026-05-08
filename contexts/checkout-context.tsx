"use client";

import { Item, VolumeInfo } from "@/types/books";
import { Participant } from "@/types/user";
import { createContext, useContext, useState } from "react";

type CheckoutContext = {
  participant: Participant | null;
  setParticipant: React.Dispatch<React.SetStateAction<Participant | null>>;
  currBook: VolumeInfo | null;
  setCurrBook: React.Dispatch<React.SetStateAction<VolumeInfo | null>>;
  cart: Item[];
  setCart: React.Dispatch<React.SetStateAction<Item[]>>;
};

export const CheckoutContext = createContext<CheckoutContext | null>(null);

export default function CheckoutContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currBook, setCurrBook] = useState<VolumeInfo | null>(null);
  const [cart, setCart] = useState<Item[]>([]);
  return (
    <CheckoutContext.Provider
      value={{
        participant,
        setParticipant,
        currBook,
        setCurrBook,
        cart,
        setCart,
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
