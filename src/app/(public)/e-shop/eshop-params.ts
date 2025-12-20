import { useQueryStates } from "nuqs";
import {
  createLoader,
  type Options,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { createTypedLink } from "@/lib/typed-links";

export const SORT_OPTIONS = [
  "sort_order",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

const eshopParams = {
  q: parseAsString.withDefault(""),
  category: parseAsString.withDefault(""),
  sort: parseAsStringEnum([...SORT_OPTIONS]).withDefault("sort_order"),
};

export const loadEshopParams = createLoader(eshopParams);

export const useEshopParams = (options: Options = {}) =>
  useQueryStates(eshopParams, {
    ...options,
    shallow: false,
  });

export const getCategoriesLink = createTypedLink("/e-shop", eshopParams);

export type EshopParams = {
  q: string;
  category: string;
  sort: SortOption | null;
};
