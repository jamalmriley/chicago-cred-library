"use client";

import BookReturn from "@/components/BookReturn";
import ParticipantSelect from "@/components/ParticipantSelect";
import ReturnConfirm from "@/components/ReturnConfirm";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Spinner } from "@/components/ui/spinner";
import { useKioskContext } from "@/contexts/kiosk-context";
import { Participant } from "@/types/cred";
import { KioskItem } from "@/types/library";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReturnPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const {
    maxCheckoutStepAllowed,
    setMaxCheckoutStepAllowed,
    participant,
    setParticipant,
    returns,
    setReturns,
    setCart,
    setCurrBook,
  } = useKioskContext();
  const isNextButtonDisabled = current + 1 > maxCheckoutStepAllowed;
  const today = new Date();

  const handleReturn = async (participant: Participant) => {
    await setIsLoading(true);

    const res = await fetch(`/api/participants?id=${participant.id}`);

    if (!res.ok) {
      toast.error(
        `There was an issue processing your book${returns.length === 1 ? "" : "s"} out. Please try again.`,
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

    const updateCheckoutHistory = (
      checkoutHistory: KioskItem[] | null,
      returns: KioskItem[],
    ): KioskItem[] | null => {
      const result: KioskItem[] = [];
      if (!checkoutHistory) return null;

      for (const checkoutItem of checkoutHistory) {
        for (const r of returns) {
          if (checkoutItem.book_info.id === r.book_info.id) result.push(r);
          else result.push(checkoutItem);
        }
      }

      return result;
    };

    const updatedCheckoutHistory = updateCheckoutHistory(
      checkout_history,
      returns,
    );

    await fetch(`/api/participants?id=${participant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkout_history: updatedCheckoutHistory,
        updated_at: today,
      }),
    })
      .then(() => {
        setMaxCheckoutStepAllowed(3);
        api?.scrollNext();
      })
      .catch(() => {
        toast.error(
          `There was an issue processing your book${returns.length === 1 ? "" : "s"} out. Please try again.`,
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
            {participant && <BookReturn participant={participant} />}
          </CarouselItem>
          <CarouselItem>
            {participant && <ReturnConfirm participant={participant} />}
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
            <Link href="/kiosk">
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
              handleReturn(participant);
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
