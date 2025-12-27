"use client";

import {
  type Options,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { createTypedLink } from "@/lib/typed-links";

const categoryParams = {
  categoryId: parseAsString,
  q: parseAsString,
  name: parseAsString,
  isActive: parseAsBoolean,
};

export const useCategoryParams = (options: Options = {}) =>
  useQueryStates(categoryParams, {
    ...options,
    shallow: false,
  });

export const getAdminCategoriesLink = createTypedLink(
  "/admin/categories",
  categoryParams
);
