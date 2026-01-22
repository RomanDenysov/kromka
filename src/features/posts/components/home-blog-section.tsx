import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { getLatestPosts } from "@/features/posts/api/queries";
import { BlogCard } from "./blog-card";

type Props = {
  className?: string;
};

export async function HomeBlogSection({ className }: Props) {
  const posts = await getLatestPosts(3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <Container className="space-y-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="space-y-2">
            <h2 className="font-semibold text-2xl tracking-tight md:text-3xl">
              Z nášho magazínu
            </h2>
            <p className="text-muted-foreground">
              Recepty, tipy a novinky zo sveta pekárenstva
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/blog">
              Všetky články
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <BlogCard key={post.id} post={post} preload={index < 3} />
          ))}
        </div>
      </Container>
    </section>
  );
}
