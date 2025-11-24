import { parseAsString, useQueryStates } from "nuqs";

export function useEshopParams() {
  const [params, setParams] = useQueryStates({
    category: parseAsString,
  });

  return {
    category: params.category,
    setParams,
  };
}
