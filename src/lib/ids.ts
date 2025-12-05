import { createId as _createId, init } from "@paralleldrive/cuid2";

const shortId = init({ length: 8 });

const PREFIX_PATTERN = /^[a-zA-Z0-9_-]+$/;

const RANDOM_NUMBER_LENGTH = 5;
const RANDOM_NUMBER_MAX = 100_000;
export const createId = _createId;
export const createShortId = shortId;

/**
 * Creates a prefixed ID using the default CUID2 generator.
 * @param prefix - The prefix to prepend to the ID (must be non-empty and match /^[a-zA-Z0-9_-]+$/)
 * @returns A string in the format "{prefix}-{id}"
 * @throws {Error} If prefix is empty or contains invalid characters
 */
export function createPrefixedId(prefix: string): string {
  if (!prefix || prefix.trim().length === 0) {
    throw new Error("Prefix must be non-empty");
  }
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(
      "Prefix must contain only alphanumeric characters, underscores, or hyphens"
    );
  }
  return `${prefix}-${createId()}`;
}

/**
 * Creates a prefixed short ID using the 8-character CUID2 generator.
 * @param prefix - The prefix to prepend to the ID (must be non-empty and match /^[a-zA-Z0-9_-]+$/)
 * @returns A string in the format "{prefix}-{shortId}"
 * @throws {Error} If prefix is empty or contains invalid characters
 */
export function createPrefixedShortId(prefix: string): string {
  if (!prefix || prefix.trim().length === 0) {
    throw new Error("Prefix must be non-empty");
  }
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(
      "Prefix must contain only alphanumeric characters, underscores, or hyphens"
    );
  }
  return `${prefix}-${createShortId()}`;
}

/**
 * Creates a numeric ID based on timestamp + random suffix.
 * Format: YYYYMMDD-XXXXX (e.g., 20250605-84729)
 * Good for: order numbers, invoice numbers
 */
export function createNumericId(timezone = "Europe/Bratislava"): string {
  const now = new Date();
  const dateStr = now
    .toLocaleDateString("sv-SE", { timeZone: timezone })
    .replace(/-/g, "");

  // 5-digit random number (00000-99999)
  const random = Math.floor(Math.random() * RANDOM_NUMBER_MAX)
    .toString()
    .padStart(RANDOM_NUMBER_LENGTH, "0");

  return `${dateStr}-${random}`;
}

/**
 * Creates a prefixed numeric ID.
 * Format: {prefix}-YYYYMMDD-XXXXX (e.g., ORD-20250605-84729)
 */
export function createPrefixedNumericId(
  prefix: string,
  timezone = "Europe/Bratislava"
): string {
  if (!prefix || prefix.trim().length === 0) {
    throw new Error("Prefix must be non-empty");
  }
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(
      "Prefix must contain only alphanumeric characters, underscores, or hyphens"
    );
  }
  return `${prefix.toUpperCase()}-${createNumericId(timezone)}`;
}

/**
 * Creates a short numeric ID (timestamp-based, no date prefix).
 * Format: XXXXX-XXXXX (e.g., 84729-31456)
 * ~10 billion combinations
 */
export function createShortNumericId(): string {
  const timestamp = Date.now() % RANDOM_NUMBER_MAX; // Last 5 digits of timestamp
  const random = Math.floor(Math.random() * RANDOM_NUMBER_MAX);
  return `${timestamp.toString().padStart(RANDOM_NUMBER_LENGTH, "0")}-${random.toString().padStart(RANDOM_NUMBER_LENGTH, "0")}`;
}
