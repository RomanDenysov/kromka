"use client";

import { ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMapUrl } from "@/lib/geo-utils";

type StoreNavigationButtonProps = {
  address: string;
  latitude?: string | null;
  longitude?: string | null;
  variant?: "link" | "button";
};

export function StoreNavigationButton({
  address,
  latitude,
  longitude,
  variant = "button",
}: StoreNavigationButtonProps) {
  const mapUrl = getMapUrl(address, latitude, longitude);

  if (variant === "link") {
    return (
      <a
        className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
        href={mapUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Otvoriť v Mapách
        <ExternalLink className="size-3.5" />
      </a>
    );
  }

  return (
    <Button asChild variant="outline">
      <a href={mapUrl} rel="noopener noreferrer" target="_blank">
        <Navigation className="size-4" />
        Navigovať
      </a>
    </Button>
  );
}
