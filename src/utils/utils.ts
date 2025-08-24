import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Deadline helpers
export function calculateRemainingTimeSeconds(deadlineMs: number | null): number {
  if (!deadlineMs) return 0;
  return Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));
}

export function computeResumeDeadlineMs(currentRemainingSeconds: number): number {
  return Date.now() + currentRemainingSeconds * 1000;
}
