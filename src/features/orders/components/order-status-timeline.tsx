import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { UserOrderDetail } from "@/features/user-profile/api/queries";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/constants";

interface OrderStatusTimelineProps {
  events: UserOrderDetail["statusEvents"];
}

export function OrderStatusTimeline({ events }: OrderStatusTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-sm">Historia stavu</h3>
      <div className="relative flex flex-col gap-3 pl-6">
        <div className="absolute top-1 bottom-1 left-[7px] w-px bg-border" />
        {events.map((event) => (
          <div className="relative flex flex-col gap-0.5" key={event.id}>
            <div className="absolute top-1 -left-6 size-3.5 rounded-full border-2 border-background bg-muted-foreground/30" />
            <div className="flex items-center gap-2">
              <Badge
                className="text-xs"
                variant={ORDER_STATUS_VARIANTS[event.status] ?? "default"}
              >
                {ORDER_STATUS_LABELS[event.status] ?? event.status}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {format(event.createdAt, "d. MMM yyyy, HH:mm", {
                  locale: sk,
                })}
              </span>
            </div>
            {event.note && (
              <p className="text-muted-foreground text-xs">{event.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
