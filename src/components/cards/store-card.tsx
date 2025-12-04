"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { DaySchedule } from "@/db/types";
import type { Store } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";

type StoreCardProps = {
  store: Store;
  className?: string;
  isSelected?: boolean;
  href?: Route;
  variant?: "default" | "featured";
};

const getTodayOpeningHours = (openingHours: Store["openingHours"]) => {
  if (!openingHours) {
    return null;
  }

  const today = new Date();
  const dayName = format(today, "EEEE", { locale: sk }).toLowerCase();
  const dateStr = format(today, "yyyy-MM-dd");

  if (openingHours.exceptions?.[dateStr]) {
    return openingHours.exceptions[dateStr];
  }

  // @ts-expect-error - day types
  return openingHours.regularHours?.[dayName] || null;
};

const formatTimeRange = (schedule: DaySchedule | null) => {
  if (!schedule || schedule === "closed") {
    return "Zatvorené";
  }
  return `${schedule.start} – ${schedule.end}`;
};

const isOpen = (schedule: DaySchedule | null) =>
  schedule && schedule !== "closed";

export function StoreCard({
  store,
  className,
  isSelected,
  href,
  variant = "default",
}: StoreCardProps) {
  const todaySchedule = getTodayOpeningHours(store.openingHours);
  const storeIsOpen = isOpen(todaySchedule);

  const CardContent = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md bg-neutral-900",
        variant === "featured" ? "min-h-[320px]" : "min-h-[240px]",
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-background",
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
      </div>

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-10">
          <span className="rounded-full bg-white px-3 py-1 font-medium text-neutral-900 text-xs">
            Vybraná predajňa
          </span>
        </div>
      )}

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
  isSelected,
  onClick,
}: {
  store: Store;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const todaySchedule = getTodayOpeningHours(store.openingHours);
  const storeIsOpen = isOpen(todaySchedule);

  return (
    <button
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors",
        isSelected
          ? "bg-neutral-900 text-white"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
          <h4
            className={cn(
              "truncate font-medium",
              isSelected ? "text-white" : "text-foreground"
            )}
          >
            {store.name}
          </h4>
          <div
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              storeIsOpen ? "bg-green-500" : "bg-neutral-400"
            )}
          />
        </div>
        {store.address && (
          <p
            className={cn(
              "mt-0.5 truncate text-sm",
              isSelected ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {[store.address.street, store.address.city]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>

      {/* Checkmark */}
      {isSelected && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white">
          <svg
            aria-label="Checkmark"
            className="size-4 text-neutral-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Checkmark</title>
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
      )}
    </button>
  );
}
