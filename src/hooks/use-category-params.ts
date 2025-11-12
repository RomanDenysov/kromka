"use client";

import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function useCategoryParams() {
  const [params, setParams] = useQueryStates({
    categoryId: parseAsString,
    q: parseAsString,
    name: parseAsString,
    isActive: parseAsBoolean,
  });

  return {
    ...params,
    setParams,
  };
}
