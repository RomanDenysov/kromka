"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TableCategory } from "@/components/tables/categories/table";
import { useTRPC } from "@/trpc/client";

export function useCreateDraftCategory() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.categories.list.queryKey();

  // TODO: Add feature flag to disable/enable drawer navigation after creating a draft category
  // const { setParams } = useCategoryParams();
  return useMutation(
    trpc.admin.categories.createDraft.mutationOptions({
      onSuccess: async (newCategory) => {
        await queryClient.invalidateQueries({
          queryKey,
        });
        // setParams({ categoryId: newCategory.id });
        router.push(`/admin/categories/${newCategory.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}

export function useCopyCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.categories.list.queryKey();

  return useMutation(
    trpc.admin.categories.copyCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
}

export function useToggleCategories() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.categories.list.queryKey();

  return useMutation(
    trpc.admin.categories.toggleActive.mutationOptions({
      onMutate: ({ ids }) => {
        queryClient.cancelQueries({
          queryKey,
        });
        const previousCategories = queryClient.getQueryData(queryKey);
        if (previousCategories) {
          queryClient.setQueryData<TableCategory[]>(queryKey, (old) =>
            old?.map((category) =>
              ids.includes(category.id)
                ? {
                    ...category,
                    isActive: !category.isActive,
                  }
                : category
            )
          );
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
}

export function useDeleteCategories() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.categories.list.queryKey();
  return useMutation(
    trpc.admin.categories.delete.mutationOptions({
      onMutate: ({ ids }) => {
        queryClient.cancelQueries({
          queryKey,
        });
        const previousCategories = queryClient.getQueryData(queryKey);
        if (previousCategories) {
          queryClient.setQueryData<TableCategory[]>(
            queryKey,
            (old) => old?.filter((category) => !ids.includes(category.id)) ?? []
          );
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
}

export function useToggleFeaturedCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.categories.list.queryKey();

  return useMutation(
    trpc.admin.categories.toggleFeatured.mutationOptions({
      onMutate: ({ categoryId }) => {
        queryClient.cancelQueries({ queryKey });
        const previousCategories = queryClient.getQueryData(queryKey);
        if (previousCategories) {
          queryClient.setQueryData<TableCategory[]>(queryKey, (old) =>
            old?.map((category) =>
              category.id === categoryId
                ? { ...category, isFeatured: !category.isFeatured }
                : category
            )
          );
        }
        return { previousCategories };
      },
      onError: (error, _, context) => {
        if (context?.previousCategories) {
          queryClient.setQueryData(queryKey, context.previousCategories);
        }
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
}
