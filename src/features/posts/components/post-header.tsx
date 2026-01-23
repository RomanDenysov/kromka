import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PostDetail } from "@/features/posts/api/queries";
import { cn, getInitials } from "@/lib/utils";

type Props = {
  post: PostDetail;
  className?: string;
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function PostHeader({ post, className }: Props) {
  return (
    <header className={cn("flex flex-col gap-6", className)}>
      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
        {post.title}
      </h1>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-lg text-muted-foreground md:text-xl">
          {post.excerpt}
        </p>
      )}

      {/* Author and Date */}
      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarImage
            alt={post.author?.name ?? ""}
            src={post.author?.image ?? undefined}
          />
          <AvatarFallback>{getInitials(post.author?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{post.author?.name}</span>
          <time
            className="text-muted-foreground text-sm"
            dateTime={post.publishedAt?.toISOString()}
          >
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
          <Image
            alt={post.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            src={post.coverImageUrl}
          />
        </div>
      )}
    </header>
  );
}
