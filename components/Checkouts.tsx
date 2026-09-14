import { useSites } from "@/hooks/use-sites";
import { getSiteById, Participant } from "@/types/cred";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { BookMarked, SearchX } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";

export default function Checkouts() {
  const [participantsWithCheckouts, setParticipantsWithCheckouts] = useState<
    Participant[] | null
  >(null);
  const [participantsError, setCheckoutsError] = useState<string | null>(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // const refresh = () => setLastUpdated(new Date().toString());

  useEffect(() => {
    const fetchCheckouts = async () => {
      await setParticipantsLoading(true);
      const res = await fetch("/api/checkouts");

      if (!res.ok) {
        setParticipantsLoading(false);
        setParticipantsWithCheckouts(null);
        setCheckoutsError("There was an error loading checkout history.");
        console.error(await res.json());
        return;
      }

      const data: Participant[] = await res.json();
      setParticipantsLoading(false);
      setParticipantsWithCheckouts(data);
      setCheckoutsError(null);
    };

    fetchCheckouts();
  }, [lastUpdated]);

  return (
    <CheckoutsTable
      participants={participantsWithCheckouts}
      participantsError={participantsError}
      participantsLoading={participantsLoading}
    />
  );
}

function CheckoutsTable({
  participants,
  participantsError,
  participantsLoading,
}: {
  participants: Participant[] | null;
  participantsError: string | null;
  participantsLoading: boolean;
}) {
  const { sites } = useSites();
  const { user } = useUser();
  if (!user) return;
  return (
    <>
      {participantsLoading ? (
        <Table className="border">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Book</TableHead>
              <TableHead className="text-center">Purpose</TableHead>
              <TableHead className="text-center">Checkout Date</TableHead>
              <TableHead className="text-center">Due Date</TableHead>
              <TableHead className="text-center">Returned</TableHead>
              <TableHead className="text-center">Book Report</TableHead>
              {/* <AbacTableHead
                user={user}
                action="update"
                resource="participants"
                className="text-center"
              >
                Actions
              </AbacTableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-30 h-5" />
                    <Skeleton className="w-30 h-3" />
                  </div>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Skeleton className="size-10" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-30 h-5" />
                    <Skeleton className="w-30 h-3" />
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex justify-center items-center">
                    <Skeleton className="w-20 h-5" />
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex justify-center items-center">
                    <Skeleton className="w-32 h-5" />
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex justify-center items-center">
                    <Skeleton className="w-32 h-5" />
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex justify-center items-center">
                    <Skeleton className="size-5" />
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex justify-center items-center">
                    <Skeleton className="size-5" />
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : participants && participants.length > 0 ? (
        <Table className="border">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Book</TableHead>
              <TableHead className="text-center">Purpose</TableHead>
              <TableHead className="text-center">Checkout Date</TableHead>
              <TableHead className="text-center">Due Date</TableHead>
              <TableHead className="text-center">Returned</TableHead>
              <TableHead className="text-center">Book Report</TableHead>
              {/* <AbacTableHead
                user={user}
                action="update"
                resource="participants"
                className="text-center"
              >
                Actions
              </AbacTableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => {
              if (
                !participant.checkout_history ||
                participant.checkout_history.length === 0
              ) {
                return null;
              }
              return participant.checkout_history.map((checkoutItem, j) => {
                return (
                  <TableRow key={j}>
                    <TableCell>
                      <p className="font-medium">
                        {participant.first_name} {participant.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getSiteById(participant.siteId, sites)?.nickname}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="flex gap-2">
                        {checkoutItem.book.book_info.volumeInfo.imageLinks ? (
                          <div className="relative min-h-10 min-w-10 aspect-square shrink-0 rounded-sm overflow-hidden">
                            <Image
                              src={checkoutItem.book.book_info.volumeInfo.imageLinks.thumbnail.replace(
                                "http://",
                                "https://",
                              )}
                              alt={checkoutItem.book.book_info.volumeInfo.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="w-10 h-auto aspect-square bg-secondary/25 flex justify-center items-center rounded-sm shadow-sm">
                            <BookMarked className="size-full p-3 text-muted-foreground" />
                          </span>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">
                            {checkoutItem.book.book_info.volumeInfo.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {checkoutItem.book.book_info.volumeInfo.authors}
                          </p>
                        </div>
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {checkoutItem.checkout_purpose}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {format(checkoutItem.checkout_date, "eee, MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {format(checkoutItem.due_date, "eee, MMM d, yyyy")}
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox checked={checkoutItem.is_returned} />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={checkoutItem.has_completed_book_report}
                      />
                    </TableCell>
                    {/* TODO: Add icon buttons for checkout actions — Mark returned (check), Cancel checkout (X), Remind participant (timer), Edit checkout details (pencil) */}
                    {/* <AbacTableCell
                      user={user}
                      action="read"
                      resource="participants"
                      // className="flex justify-center items-center gap-1.5"
                    >
                      Coming soon
                    </AbacTableCell> */}
                  </TableRow>
                );
              });
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="w-full h-fit flex flex-col flex-1 grow justify-center items-center p-10 border rounded-xl border-muted bg-muted/50 text-muted-foreground">
          <SearchX className="size-20" />
          <p className="text-lg font-medium mb-5 select-none">
            {participantsError || "No checkout history found"}
          </p>
        </div>
      )}
    </>
  );
}
