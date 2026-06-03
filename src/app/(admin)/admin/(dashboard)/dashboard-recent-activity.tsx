import { ArrowUpRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ActivityEntry } from "@/features/activity-log/api/queries";
import { ActivityFeed } from "@/features/activity-log/components/activity-feed";

interface Props {
  activity: ActivityEntry[];
}

export function DashboardRecentActivity({ activity }: Props) {
  return (
    <section className="flex flex-col p-2">
      <div className="flex items-center justify-between gap-2 p-1">
        <h3 className="font-semibold text-base">Aktivita</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">filter</span>
          <Link
            className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
            href={"/admin/activity" as Route}
          >
            celá strana
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
      <div className="max-h-[320px] overflow-auto px-1">
        <ActivityFeed activity={activity} />
      </div>
    </section>
  );
}
