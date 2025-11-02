"use client";

import { parseAsString, useQueryState } from "nuqs";

export function useCategorySearch() {
  return useQueryState("search", parseAsString);
}
