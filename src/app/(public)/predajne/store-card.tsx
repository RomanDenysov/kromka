"use client";

import { startOfToday } from "date-fns";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { DistanceBadge } from "@/components/ui/distance-badge";
import type { TimeRange } from "@/db/types";
import {
  getTimeRangeForDate,
  parseTimeToMinutes,
} from "@/features/checkout/utils";
import type { Store } from "@/features/stores/queries";
import { cn } from "@/lib/utils";

type StoreCardProps = {
  store: Store;
  className?: string;
  isSelected?: boolean;
  href?: Route;
  variant?: "default" | "featured";
  distance?: number | null;
};

const getTodayOpeningHours = (openingHours: Store["openingHours"]) => {
  if (!openingHours) {
    return null;
  }

  const today = startOfToday();
  return getTimeRangeForDate(today, openingHours);
};

const formatTimeRange = (schedule: TimeRange | null) => {
  if (!schedule) {
    return "Zatvorené";
  }
  return `${schedule.start} – ${schedule.end}`;
};

const isCurrentlyOpen = (schedule: TimeRange | null): boolean => {
  if (!schedule) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(schedule.start);
  const endMinutes = parseTimeToMinutes(schedule.end);

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

export function StoreCard({
  store,
  className,
  href,
  variant = "default",
  distance,
}: StoreCardProps) {
  const todaySchedule = getTodayOpeningHours(store.openingHours);
  const storeIsOpen = isCurrentlyOpen(todaySchedule);

  const CardContent = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md bg-neutral-900",
        variant === "featured" ? "min-h-[420px]" : "min-h-[320px]",
        className
      )}
    >
      {/* Background Image */}
      {store.image?.url ? (
        <Image
          alt={store.name}
          className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
          fill
          src={store.image.url}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-neutral-800 to-neutral-900" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Status Indicator - subtle dot */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div
          className={cn(
            "size-2 rounded-full",
            storeIsOpen ? "bg-green-400" : "bg-neutral-500"
          )}
        />
        <span className="font-medium text-white/80 text-xs">
          {storeIsOpen ? "Otvorené" : "Zatvorené"}
        </span>
        {distance !== null &&
          distance !== undefined &&
          distance !== Number.POSITIVE_INFINITY && (
            <DistanceBadge distance={distance} />
          )}
      </div>

      {/* Selected Badge */}

      {/* Content */}
      <div className="relative z-10 mt-auto p-5">
        <h3 className="font-semibold text-lg text-white leading-tight">
          {store.name}
        </h3>

        <div className="mt-3 flex flex-col gap-1.5 text-sm text-white/70">
          {store.address && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">
                {[store.address.street, store.address.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0" />
            <span>Dnes: {formatTimeRange(todaySchedule)}</span>
          </div>
        </div>

        {/* Arrow indicator on hover */}
        {href && (
          <div className="mt-4 flex items-center gap-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
            <span>Zobraziť detail</span>
            <ArrowRight className="size-4" />
          </div>
        )}
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

// Compact variant for lists/modals
export function StoreCardCompact({
  store,
  onClick,
  distance,
}: {
  store: Store;
  onClick?: () => void;
  distance?: number | null;
}) {
  const todaySchedule = getTodayOpeningHours(store.openingHours);
  const storeIsOpen = isCurrentlyOpen(todaySchedule);

  return (
    <button
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      )}
      onClick={onClick}
      type="button"
    >
      {/* Thumbnail */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700">
        {store.image?.url ? (
          <Image
            alt={store.name}
            className="object-cover"
            fill
            src={store.image.url}
          />
        ) : null}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className={cn("truncate font-medium", "text-foreground")}>
            {store.name}
          </h4>
          <div
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              storeIsOpen ? "bg-green-500" : "bg-neutral-400"
            )}
          />
          {distance !== null &&
            distance !== undefined &&
            distance !== Number.POSITIVE_INFINITY && (
              <DistanceBadge
                className="ml-auto"
                distance={distance}
                variant="light"
              />
            )}
        </div>
        {store.address && (
          <p className={cn("mt-0.5 truncate text-sm", "text-muted-foreground")}>
            {[store.address.street, store.address.city]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>
    </button>
  );
}
