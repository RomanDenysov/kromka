import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/features/posts/api/queries";
import { cn, getInitials } from "@/lib/utils";

type Props = {
  post: Post;
  className?: string;
  preload?: boolean;
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function BlogCard({ post, className, preload = false }: Props) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md",
        className
      )}
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {post.coverImageUrl ? (
            <Image
              alt={post.title}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              loading={preload ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={post.coverImageUrl}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">Bez obrázka</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} size="xs" variant="secondary">
                  {tag.name}
                </Badge>
              ))}
              {post.tags.length > 2 && (
                <Badge size="xs" variant="outline">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="line-clamp-2 font-semibold text-base leading-snug group-hover:text-primary md:text-lg">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {post.excerpt}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer: Author and Date */}
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="size-8">
              <AvatarImage alt={post.author?.name ?? ""} src={post.author?.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(post.author?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{post.author?.name}</span>
              <time
                className="text-muted-foreground text-xs"
                dateTime={post.publishedAt?.toISOString()}
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
