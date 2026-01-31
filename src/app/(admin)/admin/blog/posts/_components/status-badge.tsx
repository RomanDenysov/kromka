import {
  CircleIcon,
  FileTextIcon,
  GlobeIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PostStatus = "draft" | "published" | "archived";

const STATUS_CONFIG: Record<
  PostStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "success";
    icon: LucideIcon;
  }
> = {
  draft: { label: "Návrh", variant: "secondary", icon: FileTextIcon },
  published: { label: "Publikovaný", variant: "success", icon: GlobeIcon },
  archived: { label: "Archivovaný", variant: "outline", icon: CircleIcon },
};

type Props = {
  status: PostStatus;
  size?: "default" | "sm" | "xs";
};

export function StatusBadge({ status, size = "xs" }: Props) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge size={size} variant={config.variant}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
