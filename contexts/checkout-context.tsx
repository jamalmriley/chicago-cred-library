"use client";

import { Item, VolumeInfo } from "@/types";
import { createContext, useContext, useState } from "react";

type CheckoutContext = {
  participantId: string;
  setParticipantId: React.Dispatch<React.SetStateAction<string>>;
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
  const [participantId, setParticipantId] = useState("");
  const [currBook, setCurrBook] = useState<VolumeInfo | null>(null);
  const [cart, setCart] = useState<Item[]>([]);
  return (
    <CheckoutContext.Provider
      value={{
        participantId,
        setParticipantId,
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
