import type { RouterOutputs } from "@/trpc/routers";

export type Product = NonNullable<RouterOutputs["admin"]["products"]["byId"]>;
export type ProductList = RouterOutputs["admin"]["products"]["list"];
