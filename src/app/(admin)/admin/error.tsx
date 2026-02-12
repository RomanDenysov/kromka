"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="font-semibold text-2xl">Admin Error</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Skúsiť znova</Button>
    </div>
  );
}
