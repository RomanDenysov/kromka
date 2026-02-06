import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllTags, getPublishedPosts } from "@/features/posts/api/queries";
import {
  BlogGrid,
  BlogGridSkeleton,
} from "@/features/posts/components/blog-grid";
import { TagFilter } from "@/features/posts/components/tag-filter";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description:
    "Recepty, tipy a novinky zo sveta pekárenstva. Prečítajte si náš blog a inšpirujte sa.",
  canonicalUrl: getSiteUrl("/blog"),
});

type Props = {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    search?: string;
  }>;
};

function getArticleCountText(total: number): string {
  if (total === 0) return "Žiadne články";
  if (total === 1) return "1 článok";
  if (total >= 2 && total <= 4) return `${total} články`;
  return `${total} článkov`;
}

async function BlogContent({ searchParams }: Props) {
  const params = await searchParams;
  const rawPage = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const tag = params.tag;
  const search = params.search;

  const [{ posts, total, totalPages }, tags] = await Promise.all([
    getPublishedPosts({ page, tag, search }),
    getAllTags(),
  ]);

  return (
    <>
      {/* Tag Filter */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <TagFilter activeTag={tag} tags={tags} />
      </Suspense>

      {/* Results Count */}
      <p className="text-muted-foreground text-sm">
        {getArticleCountText(total)}
      </p>

      {/* Blog Grid */}
      <BlogGrid posts={posts} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button asChild size="sm" variant="outline">
              <Link
                href={{
                  pathname: "/blog",
                  query: {
                    ...(tag && { tag }),
                    ...(search && { search }),
                    page: page - 1,
                  },
                }}
              >
                Predchádzajúca
              </Link>
            </Button>
          )}

          <span className="text-muted-foreground text-sm">
            Strana {page} z {totalPages}
          </span>

          {page < totalPages && (
            <Button asChild size="sm" variant="outline">
              <Link
                href={{
                  pathname: "/blog",
                  query: {
                    ...(tag && { tag }),
                    ...(search && { search }),
                    page: page + 1,
                  },
                }}
              >
                Ďalšia
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default function BlogPage(props: Props) {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Blog", href: "/blog" }]} />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
          Magazín
        </h1>
        <p className="text-lg text-muted-foreground">
          Recepty, tipy a novinky zo sveta pekárenstva
        </p>
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<BlogGridSkeleton count={6} />}>
        <BlogContent searchParams={props.searchParams} />
      </Suspense>
    </PageWrapper>
  );
}
