/**
 * Archived header “favorites” link — not used in the app while favorites are disabled.
 * Restore by importing from layout/header when rebuilding favorites.
 *
 * @deprecated Reference only.
 */
import { HeartIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  FavoritesBadge,
  FavoritesBadgeSkeleton,
} from "@/features/favorites/components/favorites-badge";
import { auth } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export async function ArchivedFavoritesLink() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return (
    <Link
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "relative hidden md:inline-flex"
      )}
      href="/profil/oblubene"
    >
      <HeartIcon className="size-5" />
      <Suspense fallback={FavoritesBadgeSkeleton}>
        <FavoritesBadge />
      </Suspense>
      <span className="sr-only">Obľúbené</span>
    </Link>
  );
}
