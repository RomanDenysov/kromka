"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Clock, MapPinIcon, StoreIcon } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";

// Use the type from the public list query
export type Store = RouterOutputs["public"]["stores"]["list"][number];

type StoreCardProps = {
  store: Store;
  className?: string;
  isActive?: boolean;
  href?: Route;
};

const getTodayOpeningHours = (openingHours: Store["openingHours"]) => {
  if (!openingHours) {
    return null;
  }

  const today = new Date();
  const dayName = format(today, "EEEE", { locale: sk }).toLowerCase();
  const dateStr = format(today, "yyyy-MM-dd");

  // Check exceptions first
  if (openingHours.exceptions?.[dateStr]) {
    return openingHours.exceptions[dateStr];
  }

  // Check regular hours
  // @ts-expect-error - types for days are correct in schema but might be mismatched in inference if strict
  return openingHours.regularHours?.[dayName] || null;
};

// biome-ignore lint/suspicious/noExplicitAny: Ignore it for now
const formatTimeRange = (schedule: any) => {
  if (!schedule || schedule === "closed") {
    return "Zatvorené";
  }
  return `${schedule.start} - ${schedule.end}`;
};

export function StoreCard({
  store,
  className,
  isActive,
  href,
}: StoreCardProps) {
  const todaySchedule = getTodayOpeningHours(store.openingHours);

  const CardContent = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
        isActive && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {store.image?.url ? (
          <Image
            alt={store.name}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            src={store.image.url}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <StoreIcon className="size-12 opacity-20" />
          </div>
        )}

        {/* Status Badge - optional overlay */}
        <div className="absolute top-2 right-2 z-10">
          <div
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium text-xs backdrop-blur-md",
              todaySchedule === "closed"
                ? "bg-destructive/90 text-destructive-foreground"
                : "bg-green-600/90 text-white"
            )}
          >
            {todaySchedule === "closed" ? "Zatvorené" : "Otvorené"}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-lg leading-tight tracking-tight">
          {store.name}
        </h3>

        <div className="mt-4 space-y-2.5 text-muted-foreground text-sm">
          {/* Address */}
          {store.address && (
            <div className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" />
              <span className="line-clamp-2">
                {[
                  store.address.street,
                  store.address.postalCode,
                  store.address.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Opening Hours */}
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Dnes:</span>
              <span>{formatTimeRange(todaySchedule)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link className="block h-full" href={href}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
