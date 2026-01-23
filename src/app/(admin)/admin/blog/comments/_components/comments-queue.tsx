"use client";

import { InboxIcon } from "lucide-react";
import type { PendingComment } from "@/features/posts/api/queries";
import { CommentPreview } from "./comment-preview";

type Props = {
  comments: PendingComment[];
};

function getPendingText(count: number): string {
  if (count === 1) return "komentár čaká";
  if (count < 5) return "komentáre čakajú";
  return "komentárov čaká";
}

export function CommentsQueue({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <InboxIcon className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">
            Žiadne komentáre na schválenie
          </h3>
          <p className="text-muted-foreground text-sm">
            Všetky komentáre boli spracované. Nové komentáre sa zobrazia tu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {comments.length} {getPendingText(comments.length)} na schválenie
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {comments.map((comment) => (
          <CommentPreview comment={comment} key={comment.id} />
        ))}
      </div>
    </div>
  );
}
