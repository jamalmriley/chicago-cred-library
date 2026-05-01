"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function BookDialog() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:9780140328721&key=${process.env.GOOGLE_BOOKS_API_KEY}`,
    )
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Simulate scan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>{JSON.stringify(data, null, 2)}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
