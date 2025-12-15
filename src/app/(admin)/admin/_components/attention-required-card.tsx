import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttentionRequired } from "@/lib/queries/dashboard-metrics";
import { cn } from "@/lib/utils";

export async function AttentionRequiredCard() {
  const data = await getAttentionRequired();

  if (data.total === 0) {
    return null;
  }

  const items = [
    {
      label: "Nespracované dnes",
      value: data.unprocessedToday,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Neuhradené (3+ dní)",
      value: data.unpaidOverdue,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Nevyzdvihnuté",
      value: data.notPickedUp,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 font-medium text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          Vyžaduje pozornosť
        </CardTitle>
        <span className="font-bold text-lg text-yellow-600 dark:text-yellow-400">
          {data.total}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              className="flex items-center justify-between text-sm"
              key={item.label}
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className={cn("font-semibold", item.color)}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
