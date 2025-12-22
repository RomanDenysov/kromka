"use client";

import {
  DatabaseIcon,
  GlobeIcon,
  InfoIcon,
  type LucideIcon,
  MegaphoneIcon,
  ServerIcon,
  ShieldIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  InfoIcon,
  ServerIcon,
  DatabaseIcon,
  GlobeIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  MegaphoneIcon,
  ShieldIcon,
  UsersIcon,
};

type SettingsRowProps = {
  icon?: LucideIcon | string;
  title: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
};

export function SettingsRow({
  icon,
  title,
  description,
  control,
  className,
}: SettingsRowProps) {
  const IconComponent = typeof icon === "string" ? ICON_MAP[icon] : icon;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-md border bg-card p-4",
        className
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        {IconComponent && (
          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground">
            <IconComponent className="size-4" />
          </div>
        )}
        <div className="flex-1 space-y-0.5">
          <div className="font-medium text-sm leading-none">{title}</div>
          {description && (
            <div className="text-muted-foreground text-xs leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center">{control}</div>
    </div>
  );
}
