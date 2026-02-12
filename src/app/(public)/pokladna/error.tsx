"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="font-semibold text-2xl">Chyba pri pokladni</h2>
      <p className="text-muted-foreground">
        Vaše produkty v košíku sú stále uložené. Skúste to znova alebo sa
        vráťte do obchodu.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Skúsiť znova</Button>
        <Button asChild variant="outline">
          <Link href="/e-shop">Späť do obchodu</Link>
        </Button>
      </div>
    </div>
  );
}
