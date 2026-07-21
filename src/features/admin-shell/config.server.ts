import "server-only";

import type { AdminServerBindings } from "./types";

/** Badge/counter bindings — list queries wire up in the table/grid PR. */
export const serverBindings = {
  counters: {},
} satisfies AdminServerBindings;
