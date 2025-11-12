import type { RouterOutputs } from "@/trpc/routers";

export type StoreById = RouterOutputs["admin"]["stores"]["byId"];
export type StoreList = RouterOutputs["admin"]["stores"]["list"];
