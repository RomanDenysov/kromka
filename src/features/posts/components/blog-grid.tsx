import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import type { Post } from "@/features/posts/api/queries";
import { cn } from "@/lib/utils";
import { BlogCard } from "./blog-card";
import { BlogCardSkeleton } from "./blog-card-skeleton";

type Props = {
  posts: Post[];
  className?: string;
};

export function BlogGrid({ posts, className }: Props) {
  if (posts.length === 0) {
    return (
      <Empty className="col-span-full mt-12 text-center md:mt-20">
        <EmptyTitle>Zatiaľ žiadne články.</EmptyTitle>
        <EmptyDescription>
          Pripravujeme pre vás nové príspevky. Sledujte nás!
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {posts.map((post, index) => (
        <div
          key={post.id}
          style={{ contentVisibility: "auto", containIntrinsicSize: "0 300px" }}
        >
          <BlogCard post={post} preload={index < 6} />
        </div>
      ))}
    </div>
  );
}

export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={`skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}
