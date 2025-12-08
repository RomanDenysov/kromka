"use client";
import { XIcon } from "lucide-react";
import { useTransition } from "react";
import { removeFromCart } from "@/lib/actions/cart";
import { Button } from "../ui/button";

export function RemoveItemButton({ id }: { id: string }) {
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
      size={"icon-sm"}
      type="button"
      variant="ghost"
    >
      <XIcon className="size-5 sm:size-6" />
      <span className="sr-only">Odstrániť z košíka</span>
    </Button>
  );
}
