"use client";

import BookCheckout from "@/components/BookCheckout";
import CheckoutConfirm from "@/components/CheckoutConfirm";
import ParticipantSelect from "@/components/ParticipantSelect";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Spinner } from "@/components/ui/spinner";
import { useAppContext } from "@/contexts/app-context";
import { useKioskContext } from "@/contexts/kiosk-context";
import { useSites } from "@/hooks/use-sites";
import { updateBookAvailability } from "@/lib/books";
import { sendGotoSms } from "@/lib/goto";
import { handleConfetti } from "@/lib/utils";
import { getSiteById, Participant } from "@/types/cred";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const {
    today,
    oneWeekFromToday,
    twoWeeksFromToday,
    threeWeeksFromToday,
    oneMonthFromToday,
  } = useAppContext();
  const {
    cart,
    setCart,
    participant,
    setParticipant,
    maxCheckoutStepAllowed,
    setMaxCheckoutStepAllowed,
    setCurrBook,
    setReturns,
  } = useKioskContext();
  const { sites } = useSites();
  const { resolvedTheme } = useTheme();
  const [site] = useQueryState("site");
  const [api, setApi] = useState<CarouselApi>();
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const isNextButtonDisabled = current + 1 > maxCheckoutStepAllowed;

  const handleCheckout = async (participant: Participant) => {
    await setIsLoading(true);

    const res = await fetch(`/api/participants?id=${participant.id}`);

    if (!res.ok) {
      toast.error(
        `There was an issue checking your book${cart.length === 1 ? "" : "s"} out. Please try again.`,
        {
          position: "bottom-right",
        },
      );
      setIsLoading(false);
      // console.error(await res.json());
      return;
    }

    const data: Participant = await res.json();
    const { checkout_history } = data;

    await fetch(`/api/participants?id=${participant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkout_history: checkout_history
          ? [...checkout_history, ...cart]
          : cart,
        updated_at: today,
      }),
    })
      .then(async () => {
        // Decrement available_count for each checked out book
        await Promise.all(
          cart.map((item) => updateBookAvailability(item.book.id, -1, today)),
        );

        await fetch("/api/send", { method: "POST" });

        const returnWindow = siteInfo?.settings?.return_window ?? "1 week";
        // TODO: Only fetch if a user has a phone number listed in Clerk.
        await sendGotoSms(
          "+13127571806",
          ["+17736290679"],
          `CRED Library: Your book checkout is complete. We hope you enjoy your book${cart.length === 1 ? "" : "s"}, ${participant.first_name}! ${cart.length === 1 ? "It's" : "They're"} due back ${
            returnWindow
              ? `in ${returnWindow}, on ${format(dueDate, "eeee, MMMM d, yyyy")}`
              : "soon"
          }.`,
        );

        setMaxCheckoutStepAllowed(3);
        api?.scrollNext();
        handleConfetti(resolvedTheme === "dark");
      })
      .catch(() => {
        toast.error(
          `There was an issue checking your book${cart.length === 1 ? "" : "s"} out. Please try again.`,
          {
            position: "bottom-right",
          },
        );
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Reset context variables upon loading.
  useEffect(() => {
    setCart([]);
    setCurrBook(null);
    setMaxCheckoutStepAllowed(1);
    setParticipant(null);
    setReturns([]);
  }, []);

  // Redirect the user if a proper state variable is not found.
  const router = useRouter();
  const siteInfo = sites ? getSiteById(site, sites) : null;

  useEffect(() => {
    if (!site || !siteInfo) router.replace("/kiosk");
  }, [site]);

  if (!siteInfo) return;

  let dueDate: Date;
  switch (siteInfo.settings?.return_extension) {
    case "1 week":
      dueDate = oneWeekFromToday;
      break;
    case "2 weeks":
      dueDate = twoWeeksFromToday;
      break;
    case "3 weeks":
      dueDate = threeWeeksFromToday;
      break;
    case "1 month":
      dueDate = oneMonthFromToday;
      break;
    default:
      dueDate = oneWeekFromToday;
      break;
  }

  return (
    <div className="p-0 flex flex-col justify-between items-center">
      <Carousel
        className={`kiosk w-full overflow-hidden`}
        setApi={setApi}
        opts={{ watchDrag: false }}
      >
        <CarouselContent>
          <CarouselItem>
            <ParticipantSelect />
          </CarouselItem>
          <CarouselItem>
            {participant && <BookCheckout participant={participant} />}
          </CarouselItem>
          <CarouselItem>
            {participant && (
              <CheckoutConfirm
                participant={participant}
                dueDate={dueDate}
                returnWindow={siteInfo.settings?.return_window ?? "1 week"}
              />
            )}
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      {/* Buttons and Navigation Dots */}
      <div className="flex gap-2 items-center mb-10">
        {current === 1 ? (
          <Button
            asChild
            variant="outline"
            size="icon"
            className="rounded-full mr-3"
          >
            <Link href={`/kiosk?site=${site}`}>
              <ArrowLeft />
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full mr-3"
            onClick={() => api?.scrollPrev()}
            disabled={isLoading || current === 1 || current === count}
          >
            <ArrowLeft />
          </Button>
        )}

        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${i === current - 1 ? "w-5 bg-primary" : "w-2 bg-muted"} h-2 rounded-full transition-all`}
          />
        ))}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full ml-3"
          onClick={() => {
            // On the last step, handle the checkout.
            // Otherwise, go to the next step.
            if (current === 2 && maxCheckoutStepAllowed === 3 && participant) {
              handleCheckout(participant);
            } else api?.scrollNext();
          }}
          disabled={isNextButtonDisabled || isLoading}
        >
          {isLoading ? (
            <Spinner />
          ) : current === 2 && maxCheckoutStepAllowed === 3 ? (
            <Check />
          ) : (
            <ArrowRight />
          )}
        </Button>
      </div>
    </div>
  );
}
