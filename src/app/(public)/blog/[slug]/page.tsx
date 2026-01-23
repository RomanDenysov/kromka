import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPostBySlug,
  getPublishedPostSlugs,
  getRelatedPosts,
  hasUserLikedPost,
} from "@/features/posts/api/queries";
import { CommentsSection } from "@/features/posts/components/comments-section";
import { LikeButton } from "@/features/posts/components/like-button";
import { PostContent } from "@/features/posts/components/post-content";
import { PostHeader } from "@/features/posts/components/post-header";
import { RelatedPosts } from "@/features/posts/components/related-posts";
import { ShareButtons } from "@/features/posts/components/share-buttons";
import { getSession } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";
import { getBlogPostingSchema, getBreadcrumbSchema } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate static params for all published blog posts.
 * Cache Components requires at least one param for build validation.
 * Returns a placeholder slug if no posts exist (will 404 at runtime).
 */
export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs();
  if (slugs.length === 0) {
    return [{ slug: "__placeholder__" }];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Článok nenájdený",
    };
  }

  const baseMetadata = createMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? "",
    canonicalUrl: getSiteUrl(`/blog/${post.slug}`),
    image: post.coverImageUrl ?? undefined,
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags.map((tag) => tag.name),
    },
  };
}

async function PostInteractions({
  postId,
  likesCount,
  url,
  title,
}: {
  postId: string;
  likesCount: number;
  url: string;
  title: string;
}) {
  const session = await getSession();
  let isLiked = false;

  if (session?.user?.id) {
    isLiked = await hasUserLikedPost(session.user.id, postId);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <LikeButton
        initialIsLiked={isLiked}
        initialLikesCount={likesCount}
        postId={postId}
      />
      <ShareButtons title={title} url={url} />
    </div>
  );
}

async function RelatedPostsSection({
  postId,
  tagIds,
}: {
  postId: string;
  tagIds: string[];
}) {
  const relatedPosts = await getRelatedPosts(postId, tagIds, 3);

  return <RelatedPosts posts={relatedPosts} />;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const postUrl = getSiteUrl(`/blog/${post.slug}`);
  const tagIds = post.tags.map((tag) => tag.id);

  // JSON-LD structured data
  const blogPostingSchema = getBlogPostingSchema({
    title: post.title,
    description: post.metaDescription ?? post.excerpt,
    slug: post.slug,
    image: post.coverImageUrl,
    authorName: post.author?.name,
    authorImage: post.author?.image,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ]);

  return (
    <PageWrapper className="max-w-4xl">
      <JsonLd data={[blogPostingSchema, breadcrumbSchema]} />
      <AppBreadcrumbs
        items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      {/* Post Header */}
      <PostHeader post={post} />

      {/* Post Content */}
      <PostContent content={post.content} />

      <Separator className="my-8" />

      {/* Interactions: Like & Share */}
      <Suspense
        fallback={
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
        }
      >
        <PostInteractions
          likesCount={post.likesCount}
          postId={post.id}
          title={post.title}
          url={postUrl}
        />
      </Suspense>

      <Separator className="my-8" />

      {/* Related Posts */}
      <Suspense fallback={null}>
        <RelatedPostsSection postId={post.id} tagIds={tagIds} />
      </Suspense>

      <Separator className="my-8" />

      {/* Comments Section */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        }
      >
        <CommentsSection commentsCount={post.commentsCount} postId={post.id} />
      </Suspense>
    </PageWrapper>
  );
}
