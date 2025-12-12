"use client";

import { Children, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type Props = {
  children: React.ReactNode;
  className?: string;
  initial?: number;
  showLessLabel?: string;
  showMoreLabel?: (remaining: number) => string;
};

export default function ShowMore({
  children,
  className,
  initial = 5,
  showLessLabel = "Zobraziť menej",
  showMoreLabel = (n) => `Zobraziť ďalšie (${n})`,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const childArray = Children.toArray(children);
  const remaining = childArray.length - initial;

  // Don't render button if nothing to expand
  if (remaining <= 0) {
    return children;
  }

  const items = expanded ? childArray : childArray.slice(0, initial);

  return (
    <>
      {items}
      <center className={cn("mt-4", className)}>
        <Button
          className="font-medium text-sm"
          onClick={() => setExpanded(!expanded)}
          type="button"
          variant="link"
        >
          {expanded ? showLessLabel : showMoreLabel(remaining)}
        </Button>
      </center>
    </>
  );
}
