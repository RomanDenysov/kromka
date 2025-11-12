import type { RouterOutputs } from "@/trpc/routers";

export type Store = NonNullable<RouterOutputs["admin"]["stores"]["byId"]>;
export type StoreList = RouterOutputs["admin"]["stores"]["list"];
