"use client";

import {
  type Options,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { createTypedLink } from "@/lib/typed-links";

const storeParams = {
  storeId: parseAsString,
  q: parseAsString,
  name: parseAsString,
  isActive: parseAsBoolean,
};

export const getAdminStoresLink = createTypedLink("/admin/stores", storeParams);

export const useStoreParams = (options: Options = {}) =>
  useQueryStates(storeParams, {
    ...options,
    shallow: false,
  });
