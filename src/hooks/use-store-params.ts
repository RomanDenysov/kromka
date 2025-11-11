import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function useStoreParams() {
  const [params, setParams] = useQueryStates({
    storeId: parseAsString,
    q: parseAsString,
    name: parseAsString,
    isActive: parseAsBoolean,
  });

  return {
    ...params,
    setParams,
  };
}
