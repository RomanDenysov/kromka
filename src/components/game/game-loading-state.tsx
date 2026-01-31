"use client";

import { Loader2 } from "lucide-react";

export function GameLoadingState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Hra sa nacitava...</p>
    </div>
  );
}
