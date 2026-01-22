import type { Post } from "@/features/posts/api/queries";
import { cn } from "@/lib/utils";
import { BlogCard } from "./blog-card";

type Props = {
  posts: Post[];
  className?: string;
};

export function RelatedPosts({ posts, className }: Props) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="font-semibold text-2xl tracking-tight">
        Podobné články
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
