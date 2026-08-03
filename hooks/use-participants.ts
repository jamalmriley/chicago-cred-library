import { useAdminContext } from "@/contexts/admin-context";
import { Participant } from "@/types/cred";
import { useEffect } from "react";

export function useParticipants() {
  const {
    lastUpdated,
    participants,
    setParticipants,
    participantsError,
    setParticipantsError,
    participantsLoading,
    setParticipantsLoading,
  } = useAdminContext();

  useEffect(() => {
    const fetchParticipants = async () => {
      await setParticipantsLoading(true);
      const res = await fetch("/api/participants");

      if (!res.ok) {
        setParticipantsLoading(false);
        setParticipants(null);
        setParticipantsError("There was an error loading participants.");
        // console.error(await res.json());
        return;
      }

      const data: Participant[] = await res.json();
      const sortedData = data.sort(
        (a, b) =>
          a.first_name.localeCompare(b.first_name) ||
          a.last_name.localeCompare(b.last_name),
      );
      setParticipantsLoading(false);
      setParticipants(sortedData);
      setParticipantsError(null);
    };

    fetchParticipants();
  }, [lastUpdated]);

  return { participants, participantsError, participantsLoading };
}
