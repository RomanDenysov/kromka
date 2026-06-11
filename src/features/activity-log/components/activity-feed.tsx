import { format, formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ActivityEntry } from "@/features/activity-log/api/queries";
import { cn } from "@/lib/utils";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_ENTITY_LABELS,
  getActivityHref,
  getActivityVisual,
  getActorRoleBadge,
} from "./activity-presentation";

interface ActivityFeedProps {
  activity: ActivityEntry[];
  /** Richer rows with actor, role badge, note and full timestamp (full page). */
  detailed?: boolean;
  emptyLabel?: string;
}

type FeedItem =
  | { kind: "single"; entry: ActivityEntry }
  | { kind: "group"; batchId: string; entries: ActivityEntry[] };

/**
 * Collapse consecutive entries sharing a `metadata.batchId` (one bulk action)
 * into a single group. Batch rows share a timestamp, so they sort adjacently.
 */
function groupFeed(activity: ActivityEntry[]): FeedItem[] {
  const items: FeedItem[] = [];
  let i = 0;
  while (i < activity.length) {
    const entry = activity[i];
    const batchId = entry.metadata?.batchId;
    if (!batchId) {
      items.push({ kind: "single", entry });
      i += 1;
      continue;
    }
    let end = i + 1;
    while (
      end < activity.length &&
      activity[end].metadata?.batchId === batchId
    ) {
      end += 1;
    }
    const entries = activity.slice(i, end);
    items.push(
      entries.length > 1
        ? { kind: "group", batchId, entries }
        : { kind: "single", entry }
    );
    i = end;
  }
  return items;
}

export function ActivityFeed({
  activity,
  emptyLabel = "Žiadna nedávna aktivita.",
  detailed = false,
}: ActivityFeedProps) {
  if (activity.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className={cn(detailed ? "divide-y" : "divide-y divide-border/60")}>
      {groupFeed(activity).map((item) =>
        item.kind === "group" ? (
          <GroupedRow
            detailed={detailed}
            entries={item.entries}
            key={item.batchId}
          />
        ) : (
          <ActivityRow
            detailed={detailed}
            entry={item.entry}
            key={item.entry.id}
          />
        )
      )}
    </div>
  );
}

function ActivityRow({
  entry,
  detailed,
}: {
  entry: ActivityEntry;
  detailed: boolean;
}) {
  const { Icon, toneClass } = getActivityVisual(entry.action, entry.entityType);
  const href = getActivityHref(entry.entityType, entry.entityId);
  const title = entry.summary ?? ACTIVITY_ACTION_LABELS[entry.action];

  const body = detailed ? (
    <DetailedBody
      entry={entry}
      Icon={Icon}
      title={title}
      toneClass={toneClass}
    />
  ) : (
    <CompactBody
      entry={entry}
      Icon={Icon}
      title={title}
      toneClass={toneClass}
    />
  );

  if (href) {
    return (
      <Link
        className={cn(
          "flex min-w-0 items-start gap-2.5 transition-colors hover:bg-accent/60",
          detailed ? "p-3" : "px-1 py-2"
        )}
        href={href}
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-2.5",
        detailed ? "p-3" : "px-1 py-2"
      )}
    >
      {body}
    </div>
  );
}

/** Split "action · detail" summaries for compact two-line rows. */
function parseCompactTitle(title: string): {
  label: string;
  detail: string | null;
} {
  const separator = " · ";
  const index = title.indexOf(separator);
  if (index === -1) {
    return { label: title, detail: null };
  }
  return {
    label: title.slice(0, index),
    detail: title.slice(index + separator.length),
  };
}

/** Slovak count: 2-4 → "objednávky", otherwise "objednávok" (groups are ≥2). */
function pluralizeOrders(count: number): string {
  const word = count >= 2 && count <= 4 ? "objednávky" : "objednávok";
  return `${count} ${word}`;
}

/**
 * One row standing in for a whole bulk action. Not linked (it spans many
 * entities); the action label is taken from the first entry's summary prefix.
 */
function GroupedRow({
  entries,
  detailed,
}: {
  entries: ActivityEntry[];
  detailed: boolean;
}) {
  const first = entries[0];
  const { Icon, toneClass } = getActivityVisual(first.action, first.entityType);
  const prefix =
    first.summary?.split(" · ")[0] ?? ACTIVITY_ACTION_LABELS[first.action];
  const title = `${prefix} · ${pluralizeOrders(entries.length)}`;

  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-2.5",
        detailed ? "p-3" : "px-1 py-2"
      )}
    >
      {detailed ? (
        <DetailedBody
          entry={first}
          Icon={Icon}
          title={title}
          toneClass={toneClass}
        />
      ) : (
        <CompactBody
          entry={first}
          Icon={Icon}
          title={title}
          toneClass={toneClass}
        />
      )}
    </div>
  );
}

interface RowBodyProps {
  entry: ActivityEntry;
  Icon: ReturnType<typeof getActivityVisual>["Icon"];
  title: string;
  toneClass: string;
}

function CompactBody({ Icon, toneClass, title, entry }: RowBodyProps) {
  const { label, detail } = parseCompactTitle(title);
  const relativeTime = formatDistanceToNow(entry.createdAt, {
    addSuffix: true,
    locale: sk,
  });

  return (
    <>
      <Icon className={cn("mt-0.5 size-4 shrink-0", toneClass)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-medium text-sm leading-snug">{label}</p>
          <span className="shrink-0 text-muted-foreground text-xs">
            {relativeTime}
          </span>
        </div>
        {detail ? (
          <p className="truncate font-mono text-muted-foreground text-xs">
            {detail}
          </p>
        ) : null}
      </div>
    </>
  );
}

function DetailedBody({ Icon, toneClass, title, entry }: RowBodyProps) {
  const roleBadge = getActorRoleBadge(entry.actorType, entry.actorId);
  const actorName = entry.actorLabel ?? "Systém";
  const note = entry.metadata?.note;

  return (
    <>
      <Icon className={cn("mt-0.5 size-5 shrink-0", toneClass)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 font-medium text-sm leading-snug">
            {title}
          </p>
          <Badge size="xs" variant={roleBadge.variant}>
            {roleBadge.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {actorName} · {ACTIVITY_ENTITY_LABELS[entry.entityType]}
        </p>
        {note ? (
          <p className="mt-1 line-clamp-2 text-muted-foreground text-xs italic">
            „{note}"
          </p>
        ) : null}
        <p className="mt-1 text-muted-foreground text-xs">
          {format(entry.createdAt, "d. M. yyyy, HH:mm", { locale: sk })}
          {" · "}
          {formatDistanceToNow(entry.createdAt, {
            addSuffix: true,
            locale: sk,
          })}
        </p>
      </div>
    </>
  );
}
