import { MessageCircleIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getPostComments } from "@/features/posts/api/queries";
import { cn } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

type Props = {
  postId: string;
  commentsCount: number;
  className?: string;
};

export async function CommentsSection({
  postId,
  commentsCount,
  className,
}: Props) {
  const comments = await getPostComments(postId);

  return (
    <section className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircleIcon className="size-5" />
        <h2 className="font-semibold text-xl">
          Komentáre ({commentsCount})
        </h2>
      </div>

      <Separator />

      {/* Comment Form */}
      <CommentForm postId={postId} />

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <CommentItem comment={comment} key={comment.id} postId={postId} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          Zatiaľ žiadne komentáre. Buďte prvý, kto pridá komentár!
        </p>
      )}
    </section>
  );
}
