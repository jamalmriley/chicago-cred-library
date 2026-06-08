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

export function capitalizeString(string: string | undefined) {
  let result = "";
  if (!string) return result;

  for (let i = 0; i < string.length; i++) {
    const char = string[i];
    if (i === 0) result += char.toUpperCase();
    else result += char;
  }
  return result;
}
