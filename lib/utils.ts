import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isLocalhost =
  typeof window !== "undefined" &&
  Boolean(
    window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0" ||
      window.location.hostname === "::1" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.endsWith(".local") ||
      /^192\.168\./.test(window.location.hostname) ||
      /^10\./.test(window.location.hostname)
  );
