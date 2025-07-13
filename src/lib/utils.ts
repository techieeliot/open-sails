import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
      function (key, value) {
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
