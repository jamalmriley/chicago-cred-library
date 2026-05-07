"use client";

import BookCheckout from "@/components/BookCheckout";
import NameSelect from "@/components/NameSelect";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import CheckoutContextProvider from "@/contexts/checkout-context";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
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
    <CheckoutContextProvider>
      <div className="page-container justify-center items-center p-0">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <NameSelect />
            </CarouselItem>
            <CarouselItem>
              <BookCheckout name="Jamal" />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        {/* Buttons and Navigation Dots */}
        <div className="flex gap-2 items-center mb-10">
          <Button
            variant="outline"
            size="icon"
            className="size-10 mr-3"
            onClick={() => api?.scrollPrev()}
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
            className="size-10 ml-3"
            onClick={() => api?.scrollNext()}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </CheckoutContextProvider>
  );
}
