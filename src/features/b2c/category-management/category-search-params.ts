import { parseAsString } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const categoriesSearchParams = {
  search: parseAsString,
  categoryId: parseAsString,
};

export const categoriesSearchParamsCache = createSearchParamsCache(
  categoriesSearchParams
);
