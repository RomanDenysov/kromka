import { CircleIcon, FileTextIcon, GlobeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PostStatus = "draft" | "published" | "archived";

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "success" }
> = {
  draft: { label: "Návrh", variant: "secondary" },
  published: { label: "Publikovaný", variant: "success" },
  archived: { label: "Archivovaný", variant: "outline" },
};

type Props = {
  status: PostStatus;
  size?: "default" | "sm" | "xs";
};

export function StatusBadge({ status, size = "xs" }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge size={size} variant={config.variant}>
      {status === "published" ? (
        <GlobeIcon className="size-3" />
      ) : status === "draft" ? (
        <FileTextIcon className="size-3" />
      ) : (
        <CircleIcon className="size-3" />
      )}
      {config.label}
    </Badge>
  );
}
