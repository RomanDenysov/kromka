import type { RouterOutputs } from "@/trpc/routers";

export type Category = NonNullable<
  RouterOutputs["admin"]["categories"]["byId"]
>;
export type CategoryList = RouterOutputs["admin"]["categories"]["list"];
