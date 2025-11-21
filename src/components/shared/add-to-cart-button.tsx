import { ShoppingCartIcon } from "lucide-react";
import { Button } from "../ui/button";

export function AddToCartButton({ id }: { id: string }) {
  return (
    <Button>
      <ShoppingCartIcon className="size-4" />
      <span className="sr-only">Add to cart</span>
    </Button>
  );
}
