"use client";

import { FileTextIcon, GlobeIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  publishPostAction,
  unpublishPostAction,
} from "@/features/posts/api/actions";

type Props = {
  postId: string;
  status: "draft" | "published" | "archived";
};

export function PostPublishButton({ postId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const isPublished = status === "published";

  const handleClick = () => {
    startTransition(async () => {
      if (isPublished) {
        await unpublishPostAction(postId);
        toast.success("Článok bol odložený");
      } else {
        await publishPostAction(postId);
        toast.success("Článok bol publikovaný");
      }
    });
  };

  const renderIcon = () => {
    if (isPending) return <Spinner />;
    if (isPublished) return <FileTextIcon className="size-4" />;
    return <GlobeIcon className="size-4" />;
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleClick}
      type="button"
      variant={isPublished ? "outline" : "secondary"}
    >
      {renderIcon()}
      {isPublished ? "Odložiť" : "Publikovať"}
    </Button>
  );
}
