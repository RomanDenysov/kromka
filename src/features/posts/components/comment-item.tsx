"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { PostComment } from "@/features/posts/api/queries";
import { cn, getInitials } from "@/lib/utils";
import { CommentForm } from "./comment-form";

type Props = {
  comment: PostComment;
  postId: string;
  className?: string;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function CommentItem({ comment, postId, className }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className={cn("flex gap-3", className)}>
      <Avatar className="size-10 shrink-0">
        <AvatarImage
          alt={comment.user?.name ?? ""}
          src={comment.user?.image ?? undefined}
        />
        <AvatarFallback>{getInitials(comment.user?.name)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.user?.name}</span>
          <time className="text-muted-foreground text-xs">
            {formatDate(comment.createdAt)}
          </time>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowReplyForm(!showReplyForm)}
            size="xs"
            variant="ghost"
          >
            {showReplyForm ? "Zrušiť" : "Odpovedať"}
          </Button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <CommentForm
            className="mt-2"
            onSuccess={() => setShowReplyForm(false)}
            parentId={comment.id}
            postId={postId}
          />
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 border-muted border-l-2 pl-4">
            {comment.replies.map((reply) => (
              <div className="flex gap-3" key={reply.id}>
                <Avatar className="size-8 shrink-0">
                  <AvatarImage
                    alt={reply.user?.name ?? ""}
                    src={reply.user?.image ?? undefined}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(reply.user?.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {reply.user?.name}
                    </span>
                    <time className="text-muted-foreground text-xs">
                      {formatDate(reply.createdAt)}
                    </time>
                  </div>
                  <p className="text-sm leading-relaxed">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
