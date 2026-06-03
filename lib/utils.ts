import { clsx, type ClassValue } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createPageTitle(
  title?: string,
  description?: string,
): Metadata {
  return {
    title: title ? `${title} | CRED Library` : "CRED Library",
    description:
      description || "A literacy initiative powered by Chicago CRED.",
  };
}
