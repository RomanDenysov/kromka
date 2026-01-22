"use client";

import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import {
  CheckIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  approveCommentAction,
  rejectCommentAction,
} from "@/features/posts/api/actions";
import type { PendingComment } from "@/features/posts/api/queries";

type Props = {
  comment: PendingComment;
};

export function CommentPreview({ comment }: Props) {
  const [isApproving, startApproving] = useTransition();
  const [isRejecting, startRejecting] = useTransition();

  const handleApprove = () => {
    startApproving(async () => {
      await approveCommentAction(comment.id);
    });
  };

  const handleReject = () => {
    startRejecting(async () => {
      await rejectCommentAction(comment.id);
    });
  };

  const isPending = isApproving || isRejecting;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage
                alt={comment.user?.name ?? "Používateľ"}
                src={comment.user?.image ?? undefined}
              />
              <AvatarFallback>
                <UserIcon className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle className="text-base">
                {comment.user?.name ?? "Neznámy používateľ"}
              </CardTitle>
              <CardDescription className="text-xs">
                {comment.user?.email}
              </CardDescription>
            </div>
          </div>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(comment.createdAt, {
              addSuffix: true,
              locale: sk,
            })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {/* Parent comment reference */}
        {comment.parent && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
            <MessageSquareIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-muted-foreground text-xs">Odpoveď na:</p>
              <p className="line-clamp-2 text-sm">{comment.parent.content}</p>
            </div>
          </div>
        )}

        {/* Comment content */}
        <div className="rounded-md border bg-background p-3">
          <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
        </div>

        {/* Post reference */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span>Článok:</span>
          <Link
            className="flex items-center gap-1 font-medium text-foreground hover:underline"
            href={`/blog/${comment.post?.slug}`}
            target="_blank"
          >
            {comment.post?.title}
            <ExternalLinkIcon className="size-3" />
          </Link>
        </div>
      </CardContent>
      <CardFooter className="gap-2 border-t pt-4">
        <Button
          className="flex-1"
          disabled={isPending}
          onClick={handleApprove}
          size="sm"
          variant="default"
        >
          {isApproving ? (
            <Spinner />
          ) : (
            <CheckIcon className="size-4" />
          )}
          Schváliť
        </Button>
        <Button
          className="flex-1"
          disabled={isPending}
          onClick={handleReject}
          size="sm"
          variant="destructive"
        >
          {isRejecting ? (
            <Spinner />
          ) : (
            <XIcon className="size-4" />
          )}
          Odmietnuť
        </Button>
      </CardFooter>
    </Card>
  );
}
