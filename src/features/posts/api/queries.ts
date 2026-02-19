import "server-only";

import type { SQL } from "drizzle-orm";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { posts, postTags, postToTags } from "@/db/schema";

// Helper to transform post cover image
function transformPost<T extends { coverImage: { url: string } | null }>(
  post: T
) {
  return {
    ...post,
    coverImageUrl: post.coverImage?.url ?? null,
  };
}

// ==========================================
// PUBLIC QUERIES (cached, for blog frontend)
// ==========================================

/**
 * Get latest published posts for homepage section
 */
export const getLatestPosts = cache(async (limit = 3) => {
  "use cache";
  cacheLife("max");
  cacheTag("posts");

  const data = await db.query.posts.findMany({
    where: (p, { eq: eqOp }) => eqOp(p.status, "published"),
    with: {
      coverImage: true,
      author: {
        columns: { id: true, name: true, image: true },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: (p, { desc: descOp }) => [descOp(p.publishedAt)],
    limit,
  });

  return data.map((post) => ({
    ...transformPost(post),
    tags: post.tags.map((t) => t.tag),
  }));
});

/**
 * Get published posts with pagination, tag filter, and search
 */
export const getPublishedPosts = cache(
  async ({
    page = 1,
    tag,
    search,
    limit = 10,
  }: {
    page?: number;
    tag?: string;
    search?: string;
    limit?: number;
  }) => {
    "use cache";
    cacheLife("max");
    cacheTag("posts");

    const offset = (page - 1) * limit;

    // Build base query conditions
    const conditions = [eq(posts.status, "published")];

    // Add search condition if provided
    if (search) {
      const escaped = search
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
      conditions.push(
        sql`(${posts.title} ILIKE ${`%${escaped}%`} OR ${posts.excerpt} ILIKE ${`%${escaped}%`})`
      );
    }

    // If tag filter is provided, get post IDs that have this tag
    let postIdsWithTag: string[] | null = null;
    if (tag) {
      const tagRecord = await db.query.postTags.findFirst({
        where: (t, { eq: eqOp }) => eqOp(t.slug, tag),
      });

      if (tagRecord) {
        const postsWithTag = await db.query.postToTags.findMany({
          where: (pt, { eq: eqOp }) => eqOp(pt.tagId, tagRecord.id),
          columns: { postId: true },
        });
        postIdsWithTag = postsWithTag.map((p) => p.postId);
      } else {
        // Tag not found, return empty
        postIdsWithTag = [];
      }
    }

    // Add tag filter condition
    if (postIdsWithTag !== null) {
      if (postIdsWithTag.length === 0) {
        return { posts: [], total: 0, totalPages: 0 };
      }
      conditions.push(inArray(posts.id, postIdsWithTag));
    }

    // Get total count and posts in parallel
    const [[{ total }], data] = await Promise.all([
      db
        .select({ total: count() })
        .from(posts)
        .where(and(...conditions)),
      db.query.posts.findMany({
        where: and(...conditions),
        with: {
          coverImage: true,
          author: {
            columns: { id: true, name: true, image: true },
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
        orderBy: (p, { desc: descOp }) => [descOp(p.publishedAt)],
        limit,
        offset,
      }),
    ]);

    const transformedPosts = data.map((post) => ({
      ...transformPost(post),
      tags: post.tags.map((t) => t.tag),
    }));

    return {
      posts: transformedPosts,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
);

/**
 * Get all published post slugs for generateStaticParams
 */
export const getPublishedPostSlugs = cache(async () => {
  "use cache";
  cacheLife("max");
  cacheTag("posts");

  const data = await db.query.posts.findMany({
    where: (p, { eq: eqOp }) => eqOp(p.status, "published"),
    columns: { slug: true },
  });

  return data.map((post) => post.slug);
});

/**
 * Get single post by slug with author, tags, and like count
 */
export const getPostBySlug = cache(async (slug: string) => {
  "use cache";
  cacheLife("max");
  cacheTag("posts", `post-${slug}`);

  const post = await db.query.posts.findFirst({
    where: (p, { eq: eqOp, and: andOp }) =>
      andOp(eqOp(p.slug, slug), eqOp(p.status, "published")),
    with: {
      coverImage: true,
      author: {
        columns: { id: true, name: true, image: true },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    return null;
  }

  return {
    ...transformPost(post),
    tags: post.tags.map((t) => t.tag),
  };
});

/**
 * Get related posts based on shared tags
 */
export const getRelatedPosts = cache(
  async (postId: string, tagIds: string[], limit = 3) => {
    "use cache";
    cacheLife("max");
    cacheTag("posts");

    if (tagIds.length === 0) {
      return [];
    }

    // Get post IDs that share any of the tags
    const relatedPostTags = await db.query.postToTags.findMany({
      where: (pt, { inArray: inArrayOp, and: andOp, ne }) =>
        andOp(inArrayOp(pt.tagId, tagIds), ne(pt.postId, postId)),
      columns: { postId: true },
    });

    const relatedPostIds = [...new Set(relatedPostTags.map((pt) => pt.postId))];

    if (relatedPostIds.length === 0) {
      return [];
    }

    const data = await db.query.posts.findMany({
      where: (p, { and: andOp, eq: eqOp, inArray: inArrayOp }) =>
        andOp(inArrayOp(p.id, relatedPostIds), eqOp(p.status, "published")),
      with: {
        coverImage: true,
        author: {
          columns: { id: true, name: true, image: true },
        },
        tags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (p, { desc: descOp }) => [descOp(p.publishedAt)],
      limit,
    });

    return data.map((post) => ({
      ...transformPost(post),
      tags: post.tags.map((t) => t.tag),
    }));
  }
);

/**
 * Get all tags with post counts (only published posts)
 */
export const getAllTags = cache(async () => {
  "use cache";
  cacheLife("max");
  cacheTag("tags");

  const result = await db
    .select({
      id: postTags.id,
      name: postTags.name,
      slug: postTags.slug,
      postCount: count(posts.id),
    })
    .from(postTags)
    .leftJoin(postToTags, eq(postToTags.tagId, postTags.id))
    .leftJoin(
      posts,
      and(eq(posts.id, postToTags.postId), eq(posts.status, "published"))
    )
    .groupBy(postTags.id, postTags.name, postTags.slug);

  return result.filter((tag) => tag.postCount > 0);
});

/**
 * Get published comments for a post
 */
export const getPostComments = cache(async (postId: string) => {
  "use cache";
  cacheLife("minutes");
  cacheTag("comments", `post-comments-${postId}`);

  const comments = await db.query.postComments.findMany({
    where: (c, { and: andOp, eq: eqOp }) =>
      andOp(eqOp(c.postId, postId), eqOp(c.isPublished, true)),
    with: {
      user: {
        columns: { id: true, name: true, image: true },
      },
      replies: {
        where: (r, { eq: eqOp }) => eqOp(r.isPublished, true),
        with: {
          user: {
            columns: { id: true, name: true, image: true },
          },
        },
        orderBy: (r, { asc }) => [asc(r.createdAt)],
      },
    },
    orderBy: (c, { desc: descOp }) => [descOp(c.createdAt)],
  });

  // Filter to only top-level comments (no parentId)
  return comments.filter((c) => !c.parentId);
});

// ==========================================
// ADMIN QUERIES (no cache, always fresh)
// ==========================================

/**
 * Get posts for admin list with pagination and status filter
 */
export async function getAdminPosts({
  page = 1,
  status,
  limit = 200,
}: {
  page?: number;
  status?: "draft" | "published" | "archived";
  limit?: number;
}) {
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (status) {
    conditions.push(eq(posts.status, status));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult, data] = await Promise.all([
    db
      .select({ total: count() })
      .from(posts)
      .where(whereCondition),
    db.query.posts.findMany({
      where: whereCondition,
      with: {
        coverImage: true,
        author: {
          columns: { id: true, name: true, image: true },
        },
        tags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (p, { desc: descOp }) => [descOp(p.createdAt)],
      limit,
      offset,
    }),
  ]);

  const total = countResult[0]?.total ?? 0;

  const transformedPosts = data.map((post) => ({
    ...transformPost(post),
    tags: post.tags.map((t) => t.tag),
  }));

  return {
    posts: transformedPosts,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get single post by ID for admin edit
 */
export async function getPostById(id: string) {
  const post = await db.query.posts.findFirst({
    where: (p, { eq: eqOp }) => eqOp(p.id, id),
    with: {
      coverImage: true,
      author: {
        columns: { id: true, name: true, image: true },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    return null;
  }

  return {
    ...transformPost(post),
    tags: post.tags.map((t) => t.tag),
    tagIds: post.tags.map((t) => t.tagId),
  };
}

/**
 * Get all tags for admin management
 */
export async function getAdminTags() {
  const tags = await db.query.postTags.findMany({
    with: {
      posts: {
        columns: { postId: true },
      },
    },
    orderBy: (t, { asc }) => [asc(t.name)],
    limit: 100,
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postCount: tag.posts.length,
  }));
}

/**
 * Get pending comments for moderation queue
 */
export async function getPendingComments() {
  const comments = await db.query.postComments.findMany({
    where: (c, { eq: eqOp }) => eqOp(c.isPublished, false),
    with: {
      user: {
        columns: { id: true, name: true, email: true, image: true },
      },
      post: {
        columns: { id: true, title: true, slug: true },
      },
      parent: {
        columns: { id: true, content: true },
      },
    },
    orderBy: (c, { desc: descOp }) => [descOp(c.createdAt)],
  });

  return comments;
}

/**
 * Check if user has liked a post
 */
export async function hasUserLikedPost(userId: string, postId: string) {
  const like = await db.query.postLikes.findFirst({
    where: (l, { and: andOp, eq: eqOp }) =>
      andOp(eqOp(l.userId, userId), eqOp(l.postId, postId)),
  });

  return !!like;
}

// Types
export type Post = Awaited<ReturnType<typeof getLatestPosts>>[number];
export type PostDetail = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;
export type AdminPost = NonNullable<Awaited<ReturnType<typeof getPostById>>>;
export type AdminPostList = Awaited<ReturnType<typeof getAdminPosts>>;
export type Tag = Awaited<ReturnType<typeof getAllTags>>[number];
export type AdminTag = Awaited<ReturnType<typeof getAdminTags>>[number];
export type PendingComment = Awaited<
  ReturnType<typeof getPendingComments>
>[number];
export type PostComment = Awaited<ReturnType<typeof getPostComments>>[number];
