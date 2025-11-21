"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useCartActions() {
  const _trpc = useTRPC();
  const _queryClient = useQueryClient();

  const { mutate: updateCart, isPending } = useMutation({});
}
