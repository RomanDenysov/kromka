import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

type Props = {
  children: ReactNode;
  icon: LucideIcon;
  title?: string;
  description?: string;
};

export function TableEmptyState({
  children,
  icon,
  title = "Žiadne výsledky.",
  description = "Vytvorte nový záznam pre vašu tabuľku.",
}: Props) {
  const Icon = icon;
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{children}</EmptyContent>
    </Empty>
  );
}
