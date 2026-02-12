"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="font-semibold text-2xl">Chyba v profile</h2>
      <p className="text-muted-foreground">
        Pri načítaní profilu nastala chyba. Skúste to znova alebo sa vráťte na
        hlavnú stránku.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Skúsiť znova</Button>
        <Button asChild variant="outline">
          <Link href="/">Späť na hlavnú stránku</Link>
        </Button>
      </div>
    </div>
  );
}
