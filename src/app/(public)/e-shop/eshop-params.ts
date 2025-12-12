import { useQueryStates } from "nuqs";
import { createLoader, parseAsString, parseAsStringEnum } from "nuqs/server";
import { createTypedLink } from "@/lib/typed-links";

const sortOptions = [
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

const eshopParams = {
  q: parseAsString.withDefault(""),
  category: parseAsString.withDefault(""),
  sort: parseAsStringEnum([...sortOptions]).withDefault("name_asc"),
};

export const loadEshopParams = createLoader(eshopParams);

export const useEshopParams = () => useQueryStates(eshopParams);

export const getCategoriesLink = createTypedLink("/e-shop", eshopParams);

export type EshopParams = {
  q: string;
  category: string;
  sort: (typeof sortOptions)[number] | null;
};
