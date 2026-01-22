"use client";

import { GlobeIcon, FileTextIcon } from "lucide-react";
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

  return (
    <Button
      disabled={isPending}
      onClick={handleClick}
      type="button"
      variant={isPublished ? "outline" : "secondary"}
    >
      {isPending ? (
        <Spinner />
      ) : isPublished ? (
        <FileTextIcon className="size-4" />
      ) : (
        <GlobeIcon className="size-4" />
      )}
      {isPublished ? "Odložiť" : "Publikovať"}
    </Button>
  );
}
