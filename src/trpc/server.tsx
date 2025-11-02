/** biome-ignore-all lint/complexity/noVoid: Need to ignore this */
/** biome-ignore-all lint/suspicious/noExplicitAny: Need to ignore this */
import "server-only"; // <-- ensure this file cannot be imported from the client

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { headers } from "next/headers";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { type AppRouter, appRouter } from "./routers";

export const getQueryClient = cache(makeQueryClient);

const createContext = cache(async () => {
  const hdrs = new Headers(await headers());
  hdrs.set("x-trpc-source", "rsc");

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log("server headers", hdrs);
  return await createTRPCContext({
    headers: hdrs,
  });
});

const createCaller = cache(async () => {
  const context = await createContext();
  return appRouter.createCaller(context);
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// Direct server caller for prefetching (bypasses HTTP)
export const api = createCaller;

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
export function batchPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptionsArray: T[]
) {
  const queryClient = getQueryClient();

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
      void queryClient.prefetchQuery(queryOptions);
    }
  }
}
