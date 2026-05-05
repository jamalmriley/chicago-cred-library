"use client";

import BookScan from "@/components/BookScan";
import NameSelect from "@/components/NameSelect";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
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
    <div className="page-container justify-center items-center p-0">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          <CarouselItem>
            <NameSelect />
          </CarouselItem>
          <CarouselItem>
            <BookScan name="Jamal" />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <div className="flex gap-2 items-center mb-10">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`${i === current - 1 ? "w-5 bg-primary" : "w-2 bg-muted"} h-2 rounded-full transition-all`}
            />
          ))}
      </div>
    </div>
  );
}
