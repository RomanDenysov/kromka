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

export function ActivityFeed({
  activity,
  emptyLabel = "Žiadna nedávna aktivita.",
  detailed = false,
}: ActivityFeedProps) {
  if (activity.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className={cn(detailed ? "divide-y" : "space-y-0.5")}>
      {activity.map((entry) => (
        <ActivityRow detailed={detailed} entry={entry} key={entry.id} />
      ))}
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
          "flex items-start gap-3 transition-colors hover:bg-accent",
          detailed ? "p-3" : "rounded-lg p-2"
        )}
        href={href}
      >
        {body}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", detailed ? "p-3" : "p-2")}>
      {body}
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
  return (
    <>
      <Icon className={cn("mt-0.5 size-5 shrink-0", toneClass)} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm leading-snug">{title}</p>
        <p className="text-muted-foreground text-xs">
          {formatDistanceToNow(entry.createdAt, {
            addSuffix: true,
            locale: sk,
          })}
        </p>
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
          <p className="font-medium text-sm leading-snug">{title}</p>
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
