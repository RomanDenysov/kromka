"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/client";
import { isFavorite, toggleFavorite } from "@/lib/favorites/actions";
import { useLoginModalParams } from "./use-login-modal-params";

export function useFavorite(productId: string, initialValue?: boolean) {
  const { open: openLogin } = useLoginModalParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [favorite, setFavorite] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always prioritize session state - if no session, user can't have favorites
    if (!session) {
      setFavorite(false);
      setIsLoading(false);
      return;
    }

    // If we have a session and initialValue is provided, use it as optimization
    // but only if it's consistent with having a session
    if (initialValue !== undefined) {
      setFavorite(initialValue);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from server
    let cancelled = false;

    isFavorite(productId).then((result) => {
      if (!cancelled) {
        setFavorite(result);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [productId, session, initialValue]);

  const toggle = () => {
    if (!session) {
      openLogin("favorites", pathname);
      return;
    }

    const previousFavorite = favorite;

    // Optimistic update
    setFavorite(!favorite);

    startTransition(async () => {
      const result = await toggleFavorite(productId);

      if (!result.success) {
        setFavorite(previousFavorite);

        if (result.error === "UNAUTHORIZED") {
          openLogin("favorites", pathname);
        } else {
          toast.error("Nastala chyba pri aktualizácii obľúbených");
        }
      }
    });
  };

  return {
    isFavorite: favorite ?? false,
    isLoading: isLoading || isPending,
    toggle,
  };
}
