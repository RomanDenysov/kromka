import "server-only";

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
// biome-ignore lint/performance/noNamespaceImport: TODO: fix this in a future
import * as schema from "./schema";

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 150;

function isTransientNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  const message = err.message.toLowerCase();
  return (
    message.includes("connection closed") ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("socket hang up")
  );
}

// Retries only pre-response network failures (request never completed).
// 5xx/429 responses are not retried to avoid double-applying writes that
// may have committed server-side before the response was cut.
neonConfig.fetchFunction = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetch(input, init);
    } catch (err) {
      lastError = err;
      if (attempt === MAX_RETRIES || !isTransientNetworkError(err)) {
        throw err;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, BASE_DELAY_MS * 2 ** attempt)
      );
    }
  }
  throw lastError;
};

const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql, schema });
