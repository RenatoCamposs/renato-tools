/**
 * Utility function to merge Tailwind CSS classes
 * Uses clsx to conditionally construct className strings
 * Uses tailwind-merge to merge Tailwind classes without conflicts
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
