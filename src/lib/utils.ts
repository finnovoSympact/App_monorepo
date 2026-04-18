import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names using clsx and tailwind-merge.
 * Use this in every component that composes Tailwind classes conditionally.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Tunisian Dinar. Use this instead of raw toLocaleString
 * so every financial display is consistent across the app.
 */
export function formatTND(value: number, fractionDigits = 3): string {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Short, human-friendly number formatting (e.g. 12.4K, 1.2M).
 * Useful for dashboard tiles where precision is less important than readability.
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Sleep helper. Occasionally useful to pace demo streams.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
