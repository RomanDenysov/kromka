import { Suspense } from "react";
import { getCounter } from "@/features/admin-shell/config.server";
import type { CounterKey } from "@/features/admin-shell/types";
import { cn } from "@/lib/utils";
import { formatBadgeCount } from "@/widgets/admin-sidebar/sidebar-utils";

interface AdminNavBadgeProps {
  badgeKey?: CounterKey;
  badgeKeys?: CounterKey[];
  variant?: "sidebar" | "tab";
}

async function AdminNavBadgeInner({
  badgeKey,
  badgeKeys,
  variant = "sidebar",
}: AdminNavBadgeProps) {
  const keys = badgeKey ? [badgeKey] : (badgeKeys ?? []);
  if (keys.length === 0) {
    return null;
  }

  const counts = await Promise.all(keys.map((key) => getCounter(key)));
  const count = counts.reduce((sum, value) => sum + value, 0);
  const label = formatBadgeCount(count);
  if (!label) {
    return null;
  }

  if (variant === "tab") {
    return (
      <span
        className={cn(
          "rounded-full px-1.5 font-medium text-[10px] tabular-nums",
          "bg-muted text-muted-foreground",
          "group-data-[active=true]/tab:bg-primary/15 group-data-[active=true]/tab:text-primary"
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 font-medium text-[10px] tabular-nums",
        "bg-primary text-primary-foreground",
        "group-data-[active=true]/nav-item:border group-data-[active=true]/nav-item:border-primary group-data-[active=true]/nav-item:bg-primary-foreground group-data-[active=true]/nav-item:text-primary"
      )}
    >
      {label}
    </span>
  );
}

export function AdminNavBadge(props: AdminNavBadgeProps) {
  const keys = props.badgeKey ? [props.badgeKey] : (props.badgeKeys ?? []);
  if (keys.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AdminNavBadgeInner {...props} />
    </Suspense>
  );
}
