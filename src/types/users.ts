import type { RouterOutputs } from "@/trpc/routers";

export type User = NonNullable<RouterOutputs["admin"]["users"]["byId"]>;
export type UserList = RouterOutputs["admin"]["users"]["list"];
