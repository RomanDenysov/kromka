import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

const DEFAULT_PAGE_SIZE = 16;

export function useProductParams() {
  const [params, setParams] = useQueryStates({
    productId: parseAsString,
    q: parseAsString,
    status: parseAsString,
    sort: parseAsString,
    order: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  });

  return {
    ...params,
    setParams,
  };
}
