import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional classNames and
 * resolves Tailwind conflicts correctly
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
