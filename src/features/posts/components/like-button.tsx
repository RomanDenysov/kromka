"use client";

import { HeartIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLike } from "@/hooks/use-like";
import { cn } from "@/lib/utils";

type Props = Omit<ButtonProps, "onClick"> & {
  postId: string;
  initialIsLiked?: boolean;
  initialLikesCount?: number;
  showCount?: boolean;
};

export function LikeButton({
  postId,
  initialIsLiked,
  initialLikesCount,
  showCount = true,
  className,
  size = "sm",
  variant = "outline",
  ...props
}: Props) {
  const { isLiked, likesCount, toggle, isPending } = useLike(
    postId,
    initialIsLiked,
    initialLikesCount
  );

  return (
    <Button
      className={cn("gap-2", className)}
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <HeartIcon
          className={cn(
            "size-4 transition-all",
            isLiked
              ? "fill-current text-destructive"
              : "fill-none text-foreground"
          )}
        />
      )}
      {showCount && <span>{likesCount}</span>}
      <span className="sr-only">
        {isLiked ? "Zrušiť páči sa mi" : "Páči sa mi"}
      </span>
    </Button>
  );
}
