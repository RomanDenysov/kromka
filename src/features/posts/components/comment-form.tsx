"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { submitCommentAction } from "@/features/posts/api/actions";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useLoginModalOpen } from "@/store/login-modal-store";

type Props = {
  postId: string;
  parentId?: string;
  className?: string;
  onSuccess?: () => void;
};

export function CommentForm({ postId, parentId, className, onSuccess }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const openLogin = useLoginModalOpen();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      openLogin("default", pathname);
      return;
    }

    if (!content.trim()) {
      toast.error("Napíšte komentár");
      return;
    }

    startTransition(async () => {
      const result = await submitCommentAction({
        postId,
        content: content.trim(),
        parentId,
      });

      if (result.success) {
        setContent("");
        toast.success("Komentár odoslaný. Po schválení bude zverejnený.");
        router.refresh();
        onSuccess?.();
      } else {
        toast.error("Nepodarilo sa odoslať komentár");
      }
    });
  };

  if (!session) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed p-4 text-center",
          className
        )}
      >
        <p className="text-muted-foreground text-sm">
          Pre pridanie komentára sa{" "}
          <button
            className="font-medium text-primary underline underline-offset-4"
            onClick={() => openLogin("default", pathname)}
            type="button"
          >
            prihláste
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form className={cn("flex flex-col gap-3", className)} onSubmit={handleSubmit}>
      <Textarea
        disabled={isPending}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Napíšte odpoveď..." : "Napíšte komentár..."}
        rows={3}
        value={content}
      />
      <div className="flex justify-end">
        <Button disabled={isPending || !content.trim()} size="sm" type="submit">
          {isPending && <Spinner className="mr-2" />}
          {parentId ? "Odpovedať" : "Odoslať komentár"}
        </Button>
      </div>
    </form>
  );
}
