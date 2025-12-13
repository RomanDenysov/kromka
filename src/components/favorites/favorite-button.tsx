"use client";

import { HeartIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFavorite } from "@/hooks/use-favorite";
import { cn } from "@/lib/utils";

type Props = ButtonProps & {
  productId: string;
  initialIsFavorite?: boolean;
};

export function FavoriteButton({
  productId,
  className,
  size = "icon-sm",
  variant = "ghost",
  initialIsFavorite,
}: Props) {
  const { isFavorite, isLoading, toggle } = useFavorite(
    productId,
    initialIsFavorite
  );

  return (
    <Button
      className={cn(className)}
      disabled={isLoading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      size={size}
      type="button"
      variant={variant}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <HeartIcon
          className={cn(
            "transition-all",
            isFavorite
              ? "fill-current text-destructive"
              : "fill-none text-foreground"
          )}
        />
      )}
      <span className="sr-only">
        {isFavorite ? "Odstrániť z obľúbených" : "Pridať do obľúbených"}
      </span>
    </Button>
  );
}
