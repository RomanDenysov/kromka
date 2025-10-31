import { createId as _createId, init } from "@paralleldrive/cuid2";

const shortId = init({ length: 8 });

const PREFIX_PATTERN = /^[a-zA-Z0-9_-]+$/;

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
