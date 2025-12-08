"use client";

import { XIcon } from "lucide-react";
import { useTransition } from "react";
import { removeFromCart } from "@/lib/actions/cart";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../ui/button";
import { Spinner } from "../ui/spinner";

type Props = ButtonProps & {
  id: string;
  iconClassName?: string;
};

export function RemoveItemButton({
  id,
  variant = "ghost",
  size = "icon-sm",
  iconClassName,
  ...props
}: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      aria-label="Odstrániť z košíka"
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          removeFromCart(id);
        })
      }
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <XIcon className={cn("size-5 sm:size-6", iconClassName)} />
      )}
      <span className="sr-only">Odstrániť z košíka</span>
    </Button>
  );
}
