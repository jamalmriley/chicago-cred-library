"use client";

import BookCheckout from "@/components/BookCheckout";
import CheckoutConfirm from "@/components/CheckoutConfirm";
import NameSelect from "@/components/NameSelect";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { participant, maxCheckoutStepAllowed } = useCheckoutContext();
  const isNextButtonDisabled = current + 1 > maxCheckoutStepAllowed;

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

  return (
    <div className="page-container justify-center items-center p-0">
      <Carousel
        setApi={setApi}
        opts={{ watchDrag: false }}
        className="w-full overflow-hidden"
      >
        <CarouselContent>
          <CarouselItem>
            <NameSelect />
          </CarouselItem>
          <CarouselItem>
            {participant && <BookCheckout participant={participant} />}
          </CarouselItem>
          <CarouselItem>
            {participant && <CheckoutConfirm participant={participant} />}
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      {/* Buttons and Navigation Dots */}
      <div className="flex gap-2 items-center mb-10">
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full mr-3"
          onClick={() => api?.scrollPrev()}
          disabled={current === 1}
        >
          <ArrowLeft />
        </Button>
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`${i === current - 1 ? "w-5 bg-primary" : "w-2 bg-muted"} h-2 rounded-full transition-all`}
            />
          ))}
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full ml-3"
          onClick={() => api?.scrollNext()}
          disabled={isNextButtonDisabled}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
