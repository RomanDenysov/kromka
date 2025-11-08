import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";

type CreateDraftCategoryResult =
  RouterOutputs["admin"]["categories"]["createDraft"];

type Options = {
  onSuccess?: (result: CreateDraftCategoryResult) => void;
  skipNavigation?: boolean;
};

export function useCreateDraftCategory({
  skipNavigation = false,
  onSuccess,
}: Options = {}) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation(
    trpc.admin.categories.createDraft.mutationOptions({
      onSuccess: async (data) => {
        await qc.invalidateQueries({
          queryKey: trpc.admin.categories.list.queryKey(),
        });
        if (!skipNavigation) {
          router.push(`/admin/b2c/categories/${data.id}`);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
