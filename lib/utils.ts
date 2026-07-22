import confetti from "canvas-confetti";
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
    title: title ? `${title} | Chicago CRED Library` : "Chicago CRED Library",
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

export function getPreferredIsbn(
  identifiers: {
    type: "ISBN_10" | "ISBN_13";
    identifier: string;
  }[],
): string {
  return (
    identifiers.find((id) => id.type === "ISBN_13")?.identifier ??
    identifiers[0].identifier
  );
}

export function handleConfetti(isDarkMode: boolean) {
  const end = Date.now() + 3 * 1000; // 3 seconds
  const colors = ["#ffc82c", "#ae4107", isDarkMode ? "#ffffff" : "#000000"];
  const frame = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });
    requestAnimationFrame(frame);
  };
  frame();
}

export function safeParseDate(date: string) {
  // Check if input is a 4-digit string or number (e.g., "1978" or 1978)
  const isYearOnly = /^\d{4}$/.test(String(date).trim());

  // Pad with month and day if it's just a year, otherwise leave it alone
  const standardizedInput = isYearOnly ? `${date.trim()}-01-01` : date;

  return new Date(standardizedInput);
}
