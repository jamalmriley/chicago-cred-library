"use client";

import { createContext, useContext, useState } from "react";

type AuthContext = {
  firstName: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  lastName: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  emailAddress: string;
  setEmailAddress: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  defaultSiteId: string | null;
  setDefaultSiteId: React.Dispatch<React.SetStateAction<string | null>>;
  pendingVerification: boolean;
  setPendingVerification: React.Dispatch<React.SetStateAction<boolean>>;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
};

export const AuthContext = createContext<AuthContext | null>(null);

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [defaultSiteId, setDefaultSiteId] = useState<string | null>(null);

  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [seconds, setSeconds] = useState<number>(0);

  return (
    <AuthContext.Provider
      value={{
        firstName,
        setFirstName,
        lastName,
        setLastName,
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        defaultSiteId,
        setDefaultSiteId,
        pendingVerification,
        setPendingVerification,
        code,
        setCode,
        error,
        setError,
        seconds,
        setSeconds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within a AuthContextProvider.",
    );
  }
  return context;
}
