import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlaygroundSectionProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly description?: string;
  readonly id: string;
  readonly title: string;
}

export function PlaygroundSection({
  id,
  title,
  description,
  children,
  className,
}: PlaygroundSectionProps) {
  return (
    <section className={cn("scroll-mt-20 space-y-3", className)} id={id}>
      <div>
        <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </section>
  );
}
