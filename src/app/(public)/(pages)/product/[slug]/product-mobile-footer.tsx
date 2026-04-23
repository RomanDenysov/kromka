"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { addToCart } from "@/features/cart/api/actions";
import { analytics } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";

interface Props {
  disabled: boolean;
  id: string;
  priceCents: number;
  product?: {
    name: string;
    price: number;
  };
}

export function ProductMobileFooter({
  id,
  priceCents,
  disabled,
  product,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAdd = () => {
    startTransition(async () => {
      await addToCart(id, 1);
      if (product) {
        analytics.productAdded({
          product_id: id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          cart_type: "b2c",
          source: "product_page",
        });
      }
    });
  };

  return (
    <>
      {/* Sentinel - place this around the inline CTA */}
      <div ref={sentinelRef} />

      {/* Sticky footer */}
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg md:hidden">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Cena</span>
              <span className="font-bold text-lg">
                {formatPrice(priceCents)}
              </span>
            </div>
            <Button
              className="flex-1 text-base"
              disabled={disabled || isPending}
              onClick={handleAdd}
              size="lg"
            >
              {isPending ? <Spinner /> : <ShoppingCartIcon />}
              Do košíka
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
