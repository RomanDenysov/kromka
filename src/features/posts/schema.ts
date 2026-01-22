import type { JSONContent } from "@tiptap/react";
import z from "zod";
import { MAX_STRING_LENGTH } from "@/lib/constants";

const POST_STATUSES = ["draft", "published", "archived"] as const;

// Full post form validation
export const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  excerpt: z.string().max(500).nullable(),
  content: z.custom<JSONContent>().nullable(),
  authorId: z.string(),
  coverImageId: z.string().nullable(),
  status: z.enum(POST_STATUSES),
  publishedAt: z.date().nullable(),
  metaTitle: z.string().max(MAX_STRING_LENGTH).nullable(),
  metaDescription: z.string().max(500).nullable(),
  tagIds: z.array(z.string()).optional(),
});

// Create input - minimal data for draft
export const createPostSchema = z.object({
  title: z.string().min(1).max(MAX_STRING_LENGTH).optional(),
});

// Update input - all editable fields
export const updatePostSchema = z.object({
  title: z.string().min(1).max(MAX_STRING_LENGTH).optional(),
  slug: z.string().min(1).max(MAX_STRING_LENGTH).optional(),
  excerpt: z.string().max(500).nullable().optional(),
  content: z.custom<JSONContent>().nullable().optional(),
  coverImageId: z.string().nullable().optional(),
  metaTitle: z.string().max(MAX_STRING_LENGTH).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

// Comment form validation
export const commentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(2000),
  parentId: z.string().nullable().optional(),
});

// Tag form validation
export const tagSchema = z.object({
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
});

export type PostSchema = z.infer<typeof postSchema>;
export type CreatePostSchema = z.infer<typeof createPostSchema>;
export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
export type CommentSchema = z.infer<typeof commentSchema>;
export type TagSchema = z.infer<typeof tagSchema>;
