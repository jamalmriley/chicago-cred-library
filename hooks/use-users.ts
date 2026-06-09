import { useAdminContext } from "@/contexts/admin-context";
import { User } from "@clerk/nextjs/server";
import { useEffect } from "react";

export function useUsers() {
  const {
    lastUpdated,
    users,
    setUsers,
    usersError,
    setUsersError,
    usersLoading,
    setUsersLoading,
  } = useAdminContext();

  useEffect(() => {
    const fetchUsers = async () => {
      await setUsersLoading(true);
      const res = await fetch("/api/users");

      if (!res.ok) {
        setUsersLoading(false);
        setUsers(null);
        setUsersError("There was an error loading staff.");
        // console.error(await res.json());
        return;
      }

      const data: User[] = await res.json();
      setUsersLoading(false);
      setUsers(data);
      setUsersError(null);
    };

    fetchUsers();
  }, [lastUpdated]);

  return { users, usersError, usersLoading };
}
