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
import { useKioskContext } from "@/contexts/kiosk-context";
import { getSiteById, Participant } from "@/types/cred";
import { KioskItem, LibraryBook } from "@/types/library";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const [site] = useQueryState("site");
  const [api, setApi] = useState<CarouselApi>();
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
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
  const isNextButtonDisabled = current + 1 > maxCheckoutStepAllowed;

  const today = new Date();
  const twoWeeksFromToday = today;
  twoWeeksFromToday.setDate(today.getDate() + 14);
  twoWeeksFromToday.setHours(23, 59, 0, 0);

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

    const convertCartToCheckout = (cart: LibraryBook[]): KioskItem[] => {
      const result: KioskItem[] = [];

      for (const item of cart) {
        const checkoutItem: KioskItem = {
          book: item,
          checkout_date: today,
          due_date: twoWeeksFromToday,
          return_date: null,
          is_returned: false,
          extension_count: 0,
          has_completed_book_report: false,
        };

        result.push(checkoutItem);
      }

      return result;
    };

    const checkoutItems = convertCartToCheckout(cart);

    await fetch(`/api/participants?id=${participant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkout_history: checkout_history
          ? [...checkout_history, ...checkoutItems]
          : checkoutItems,
        updated_at: today,
      }),
    })
      .then(() => {
        setMaxCheckoutStepAllowed(3);
        api?.scrollNext();
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
  const siteInfo = getSiteById(site);

  useEffect(() => {
    if (!site || !siteInfo) router.replace("/kiosk");
  }, [site]);

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
                returnDate={twoWeeksFromToday}
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
          {isLoading ? <Spinner /> : <ArrowRight />}
        </Button>
      </div>
    </div>
  );
}
