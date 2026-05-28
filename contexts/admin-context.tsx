"use client";

import { Participant } from "@/types/cred";
import { User } from "@clerk/nextjs/server";
import { createContext, useContext, useState } from "react";

type AdminContext = {
  lastUpdated: string;
  // Participants
  setLastUpdated: React.Dispatch<React.SetStateAction<string>>;
  participants: Participant[] | null;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[] | null>>;
  participantsError: string | null;
  setParticipantsError: React.Dispatch<React.SetStateAction<string | null>>;
  participantsLoading: boolean;
  setParticipantsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // Users
  users: User[] | null;
  setUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  usersError: string | null;
  setUsersError: React.Dispatch<React.SetStateAction<string | null>>;
  usersLoading: boolean;
  setUsersLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AdminContext = createContext<AdminContext | null>(null);

export default function AdminContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  // Participants
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null,
  );
  const [participantsLoading, setParticipantsLoading] = useState<boolean>(true);
  // Users
  const [users, setUsers] = useState<User[] | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  return (
    <AdminContext.Provider
      value={{
        lastUpdated,
        setLastUpdated,
        participants,
        setParticipants,
        participantsError,
        setParticipantsError,
        participantsLoading,
        setParticipantsLoading,
        users,
        setUsers,
        usersError,
        setUsersError,
        usersLoading,
        setUsersLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error(
      "useAdminContext must be used within a AdminContextProvider.",
    );
  }
  return context;
}
