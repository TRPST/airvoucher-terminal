import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine multiple class names with Tailwind CSS support.
 * Uses clsx for conditional classes and tailwind-merge to handle
 * Tailwind class conflicts properly.
 *
 * @param inputs Multiple class values to merge
 * @returns A single className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
