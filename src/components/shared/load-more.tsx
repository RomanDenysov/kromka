"use client";

import type { ForwardedRef } from "react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export function LoadMore({
  fetchNextPage,
  hasNextPage,
  ref,
  isFetching,
}: {
  fetchNextPage?: () => void;
  hasNextPage: boolean;
  ref: ForwardedRef<HTMLDivElement>;
  isFetching: boolean;
}) {
  if (!hasNextPage) {
    return null;
  }
  return (
    <div className="mt-5 flex items-center justify-center" ref={ref}>
      {fetchNextPage ? (
        <Button
          disabled={!hasNextPage || isFetching}
          onClick={() => fetchNextPage()}
        >
          {isFetching ? (
            <Spinner />
            // biome-ignore lint/style/noNestedTernary: we need to nest the ternary to get the correct type
          ) : hasNextPage ? (
            "Načítať ďalšie"
          ) : (
            "Žiadne ďalšie výsledky"
          )}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-x-2">
          <Spinner className="text-muted-foreground" />
          <p className="text-muted-foreground text-xs">Načítavam...</p>
        </div>
      )}
    </div>
  );
}
