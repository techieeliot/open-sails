import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { UNKNOWN } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string to Start Case (capitalizes the first letter of every word).
 * Note: This is not strict Title Case, which may have more nuanced rules.
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
 * @returns The string in Start Case.
 */
export function toStartCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}

/**
 * Safely stringifies an input value to pretty-printed JSON for logging.
 * Handles circular references and falls back to string representation if needed.
 * @param input - The value to stringify.
 * @returns The pretty-printed JSON string or a fallback string representation.
 */
export function safeStringify(input: unknown): string {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      input,
      (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      },
      2, // Pretty print with 2 spaces
    );
  } catch {
    return String(input);
  }
}

/**
 * Helper function to format a price as a localized currency string.
 * @param price - The numeric price to format.
 * @param locale - The locale string (default: 'en-US').
 * @param currency - The currency code (default: 'USD').
 * @returns The formatted price string in the specified currency and locale.
 */
export function formatPrice(price: number, locale: string = 'en-US', currency: string = 'USD') {
  return price.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a user ID for display purposes.
 * - If the user ID is null or undefined, returns a formatted 'UNKNOWN' string.
 * - If the user ID is a string and contains a hyphen (UUID), returns the first segment followed by ellipsis.
  if (!userId) return toStartCase(String(UNKNOWN));
 * - If the user ID is a number, returns it as a string.
 *
 * @param userId - The user ID to format (string, number, null, or undefined).
 * @returns The formatted user ID string.
 */
export function formatUserId(userId: string | number | null | undefined): string {
  if (!userId) return toStartCase(UNKNOWN);

  if (typeof userId === 'string') {
    // For UUIDs, display only the first part
    return userId.includes('-') ? `${userId.split('-')[0]}...` : userId;
  }

  // For numeric IDs, just return the number as a string
  return String(userId);
}

/**
 * Safely parses a value (string, number, null, or undefined) to a number.
 * Returns 0 if the value cannot be parsed to a valid number, including null or undefined inputs.
 * Note: Returning 0 for invalid or null/undefined inputs may mask errors; consider whether returning NaN or throwing an error would be more appropriate in your context.
 * @param value - The value to parse (string, number, null, or undefined).
 * @returns The parsed number, or 0 if parsing fails.
 */
export function parseNumeric(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

/**
 * Returns a user-friendly error message based on the error type.
 * - If the error is an instance of Error, returns its message.
 * - If the error is a string, returns it directly.
 * - For other types, returns a generic error message with the stringified value.
 * @param error - The error to process.
 * @returns A user-friendly error message.
 */
export function getErrorMessage(error: unknown): string {
  const message: string =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : `An unknown error occurred: ${safeStringify(error)}`;
  return message;
}
