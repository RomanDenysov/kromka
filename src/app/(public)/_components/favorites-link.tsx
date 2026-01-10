import { HeartIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import {
  FavoritesBadge,
  FavoritesBadgeSkeleton,
} from "@/components/favorites/favorites-badge";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/features/auth/server";
import { cn } from "@/lib/utils";

export async function FavoritesLink() {
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
