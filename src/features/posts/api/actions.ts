"use server";

import { and, eq, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  postComments,
  postLikes,
  posts,
  postTags,
  postToTags,
} from "@/db/schema";
import {
  commentSchema,
  updatePostSchema,
  type TagSchema,
  type UpdatePostSchema,
} from "@/features/posts/schema";
import { requireAdmin, requireAuth } from "@/lib/auth/guards";

// ==========================================
// POST ACTIONS (admin only)
// ==========================================

/**
 * Create a new draft post and redirect to editor
 */
export async function createPostAction() {
  const user = await requireAdmin();

  const [newPost] = await db
    .insert(posts)
    .values({
      authorId: user.id,
    })
    .returning({ id: posts.id });

  updateTag("posts");

  redirect(`/admin/blog/posts/${newPost.id}`);
}

/**
 * Update post fields
 */
export async function updatePostAction({
  id,
  post,
}: {
  id: string;
  post: UpdatePostSchema;
}) {
  await requireAdmin();

  const parsed = updatePostSchema.safeParse(post);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const { tagIds, ...updateData } = parsed.data;

  // Get current post to check for slug changes
  const currentPost = await db.query.posts.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, id),
    columns: { slug: true },
  });

  // Check if slug is taken by another post
  if (updateData.slug) {
    const slugToCheck = updateData.slug;
    const existingPost = await db.query.posts.findFirst({
      where: (p, { and: andFn, eq: eqFn, ne }) =>
        andFn(eqFn(p.slug, slugToCheck), ne(p.id, id)),
      columns: { id: true },
    });

    if (existingPost) {
      return { success: false, error: "SLUG_TAKEN" };
    }
  }

  const [updatedPost] = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning({ id: posts.id });

  if (!updatedPost) {
    return { success: false, error: "POST_NOT_FOUND" };
  }

  // Update tags if provided
  if (tagIds !== undefined) {
    // Delete existing tags
    await db.delete(postToTags).where(eq(postToTags.postId, id));

    // Insert new tags
    if (tagIds.length > 0) {
      await db.insert(postToTags).values(
        tagIds.map((tagId) => ({
          postId: id,
          tagId,
        }))
      );
    }
  }

  // Invalidate caches
  updateTag("posts");
  updateTag("tags");
  if (currentPost?.slug) {
    updateTag(`post-${currentPost.slug}`);
  }
  if (post.slug) {
    updateTag(`post-${post.slug}`);
  }

  return { success: true };
}

/**
 * Publish a post - set status to published and publishedAt timestamp
 */
export async function publishPostAction(id: string) {
  await requireAdmin();

  const [updatedPost] = await db
    .update(posts)
    .set({
      status: "published",
      publishedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug });

  updateTag("posts");
  updateTag("tags");
  if (updatedPost?.slug) {
    updateTag(`post-${updatedPost.slug}`);
  }

  return { success: true };
}

/**
 * Unpublish a post - revert to draft status
 */
export async function unpublishPostAction(id: string) {
  await requireAdmin();

  const [updatedPost] = await db
    .update(posts)
    .set({
      status: "draft",
    })
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug });

  updateTag("posts");
  updateTag("tags");
  if (updatedPost?.slug) {
    updateTag(`post-${updatedPost.slug}`);
  }

  return { success: true };
}

/**
 * Delete a post
 */
export async function deletePostAction(id: string) {
  await requireAdmin();

  const [deletedPost] = await db
    .delete(posts)
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug });

  updateTag("posts");
  updateTag("tags");
  updateTag("comments");
  if (deletedPost?.slug) {
    updateTag(`post-${deletedPost.slug}`);
  }

  refresh();
}

// ==========================================
// LIKE ACTIONS (authenticated users)
// ==========================================

/**
 * Toggle like on a post - like if not liked, unlike if already liked
 */
export async function togglePostLikeAction(postId: string) {
  const user = await requireAuth();

  const existing = await db.query.postLikes.findFirst({
    where: and(eq(postLikes.userId, user.id), eq(postLikes.postId, postId)),
  });

  if (existing) {
    // Unlike
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.userId, user.id), eq(postLikes.postId, postId)));

    // Decrement likes count (prevent negative)
    await db
      .update(posts)
      .set({
        likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)`,
      })
      .where(eq(posts.id, postId));
  } else {
    // Like - use onConflictDoNothing to handle race condition atomically
    const inserted = await db
      .insert(postLikes)
      .values({ userId: user.id, postId })
      .onConflictDoNothing()
      .returning({ userId: postLikes.userId });

    if (inserted.length > 0) {
      // Only increment if we actually inserted
      await db
        .update(posts)
        .set({
          likesCount: sql`${posts.likesCount} + 1`,
        })
        .where(eq(posts.id, postId));
    }
  }

  // Get post slug for cache invalidation
  const post = await db.query.posts.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, postId),
    columns: { slug: true },
  });

  updateTag("posts");
  if (post?.slug) {
    updateTag(`post-${post.slug}`);
  }

  refresh();
  return { success: true, liked: !existing };
}

// ==========================================
// COMMENT ACTIONS (authenticated users + admin)
// ==========================================

/**
 * Submit a comment (requires authentication, starts unpublished)
 */
export async function submitCommentAction({
  postId,
  content,
  parentId,
}: {
  postId: string;
  content: string;
  parentId?: string | null;
}) {
  const user = await requireAuth();

  const parsed = commentSchema.safeParse({ postId, content, parentId });
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  await db.insert(postComments).values({
    postId,
    userId: user.id,
    content,
    parentId: parentId ?? null,
    isPublished: false,
  });

  // Note: Don't increment commentsCount until approved

  updateTag("comments");

  return { success: true };
}

/**
 * Approve a comment (admin only) - set isPublished: true and increment commentsCount
 */
export async function approveCommentAction(id: string) {
  await requireAdmin();

  // Atomically approve only if not yet published (prevents double-approve)
  const [updated] = await db
    .update(postComments)
    .set({ isPublished: true })
    .where(
      and(eq(postComments.id, id), eq(postComments.isPublished, false))
    )
    .returning({ postId: postComments.postId });

  if (!updated) {
    // Either comment doesn't exist or was already approved
    const comment = await db.query.postComments.findFirst({
      where: (c, { eq: eqFn }) => eqFn(c.id, id),
      columns: { isPublished: true },
    });
    if (!comment) {
      return { success: false, error: "COMMENT_NOT_FOUND" };
    }
    return { success: false, error: "ALREADY_PUBLISHED" };
  }

  // Increment comments count on post
  await db
    .update(posts)
    .set({
      commentsCount: sql`${posts.commentsCount} + 1`,
    })
    .where(eq(posts.id, updated.postId));

  // Get post for cache invalidation
  const post = await db.query.posts.findFirst({
    where: (p, { eq: eqFn }) => eqFn(p.id, updated.postId),
    columns: { slug: true },
  });

  updateTag("posts");
  updateTag("comments");
  updateTag(`post-comments-${updated.postId}`);
  if (post?.slug) {
    updateTag(`post-${post.slug}`);
  }

  return { success: true };
}

/**
 * Reject a comment (admin only) - delete the comment
 */
export async function rejectCommentAction(id: string) {
  await requireAdmin();

  // Delete and return the comment to verify it existed
  const [deleted] = await db
    .delete(postComments)
    .where(eq(postComments.id, id))
    .returning({
      postId: postComments.postId,
      isPublished: postComments.isPublished,
    });

  if (!deleted) {
    return { success: false, error: "COMMENT_NOT_FOUND" };
  }

  // If comment was published, decrement count (prevent negative)
  if (deleted.isPublished) {
    await db
      .update(posts)
      .set({
        commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)`,
      })
      .where(eq(posts.id, deleted.postId));
  }

  updateTag("comments");
  updateTag(`post-comments-${deleted.postId}`);

  refresh();
  return { success: true };
}

// ==========================================
// TAG ACTIONS (admin only)
// ==========================================

/**
 * Create a new tag
 */
export async function createTagAction({ name, slug }: TagSchema) {
  await requireAdmin();

  // Check if slug already exists
  const existingTag = await db.query.postTags.findFirst({
    where: (t, { eq: eqFn }) => eqFn(t.slug, slug),
    columns: { id: true },
  });

  if (existingTag) {
    return { success: false, error: "SLUG_TAKEN" };
  }

  const [newTag] = await db
    .insert(postTags)
    .values({ name, slug })
    .returning({ id: postTags.id });

  updateTag("tags");

  return { success: true, id: newTag.id };
}

/**
 * Update a tag
 */
export async function updateTagAction({
  id,
  name,
  slug,
}: {
  id: string;
  name: string;
  slug: string;
}) {
  await requireAdmin();

  // Check if slug is taken by another tag
  const existingTag = await db.query.postTags.findFirst({
    where: (t, { and: andFn, eq: eqFn, ne }) =>
      andFn(eqFn(t.slug, slug), ne(t.id, id)),
    columns: { id: true },
  });

  if (existingTag) {
    return { success: false, error: "SLUG_TAKEN" };
  }

  await db.update(postTags).set({ name, slug }).where(eq(postTags.id, id));

  updateTag("tags");
  updateTag("posts");

  return { success: true };
}

/**
 * Delete a tag
 */
export async function deleteTagAction(id: string) {
  await requireAdmin();

  await db.delete(postTags).where(eq(postTags.id, id));

  updateTag("tags");
  updateTag("posts");

  refresh();
  return { success: true };
}
