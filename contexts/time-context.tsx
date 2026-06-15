"use client";

import { createContext, useContext, useEffect, useState } from "react";

type TimeContext = {
  today: Date;
  setToday: React.Dispatch<React.SetStateAction<Date>>;
  twoWeeksFromToday: Date;
};

export const TimeContext = createContext<TimeContext | null>(null);

export default function TimeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [today, setToday] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      // d.setHours(0, 0, 0, 0);
      setToday(d);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const twoWeeksFromToday = new Date(today);
  twoWeeksFromToday.setDate(twoWeeksFromToday.getDate() + 14);
  twoWeeksFromToday.setHours(23, 59, 0, 0);

  return (
    <TimeContext.Provider value={{ today, setToday, twoWeeksFromToday }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTimeContext() {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error(
      "useTimeContext must be used within a TimeContextProvider.",
    );
  }
  return context;
}
