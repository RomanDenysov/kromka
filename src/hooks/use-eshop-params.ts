import { parseAsString, useQueryStates } from "nuqs";

export function useEshopParams() {
  const [params, setParams] = useQueryStates({
    category: parseAsString,
  });

  return {
    categorySlug: params.category,
    setParams,
  };
}
