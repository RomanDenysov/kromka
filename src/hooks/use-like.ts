"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { togglePostLikeAction } from "@/features/posts/api/actions";
import { useSession } from "@/lib/auth/client";
import { useLoginModalOpen } from "@/store/login-modal-store";

export type UseLikeReturn = {
  isLiked: boolean;
  likesCount: number;
  toggle: () => void;
  isPending: boolean;
};

export function useLike(
  postId: string,
  initialIsLiked?: boolean,
  initialLikesCount?: number
): UseLikeReturn {
  const openLogin = useLoginModalOpen();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked ?? false);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount ?? 0);

  const toggle = () => {
    if (isPending) return;
    if (!session) {
      openLogin("default", pathname);
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    // Optimistic update
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (previousIsLiked ? prev - 1 : prev + 1));

    startTransition(async () => {
      const result = await togglePostLikeAction(postId);

      if (!result.success) {
        // Rollback on error
        setIsLiked(previousIsLiked);
        setLikesCount(previousLikesCount);
        toast.error("Nastala chyba pri aktualizácii");
      }
    });
  };

  return {
    isLiked,
    likesCount,
    toggle,
    isPending,
  };
}
