import type { RouterOutputs } from "@/trpc/routers";

export type Order = NonNullable<RouterOutputs["public"]["cart"]["getCart"]>;
