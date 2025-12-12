"use client";

import { ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  threshold?: number;
  className?: string;
};

export function ScrollToTop({ threshold = 400, className }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      aria-label="Späť nahor"
      className={cn(
        "fixed right-6 bottom-6 z-50 rounded-full shadow-lg transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
        className
      )}
      onClick={scrollToTop}
      size="icon"
      variant="secondary"
    >
      <ArrowUpIcon className="size-5" />
    </Button>
  );
}
