import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { deserialize, serialize } from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // biome-ignore lint/style/noMagicNumbers: Ignore magic numbers here
        staleTime: 60 * 1000,
      },
      dehydrate: {
        serializeData: serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "success",
      },
      hydrate: {
        deserializeData: deserialize,
      },
    },
  });
}
