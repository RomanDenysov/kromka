import { getFavoritesCount } from "@/lib/favorites/queries";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

export async function FavoritesBadge() {
  const count = await getFavoritesCount();

  if (count === 0) {
    return null;
  }

  return (
    <Badge
      className="-top-1.5 -right-1.5 absolute aspect-square h-4 w-auto px-0.5 py-0 font-semibold text-[10px]"
      variant="default"
    >
      {count}
    </Badge>
  );
}

export const FavoritesBadgeSkeleton = (
  <Skeleton className="-top-1.5 -right-1.5 absolute size-4 rounded-full" />
);
