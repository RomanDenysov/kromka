# Blog Implementation - Optimized Plan

## Analysis Summary

**What's Already Done:**
- Database schema (posts, postTags, postToTags, postComments, postLikes)
- TipTap editor with full/simple variants
- MediaInput supporting "posts" folder
- Admin blog route stubs (/admin/blog/posts, tags, comments)
- All form field components (TextField, RichTextField, etc.)

**High Reuse Patterns:**
- `src/features/products/` → template for `src/features/posts/`
- `src/hooks/use-favorite.ts` → adapt to `use-like.ts`
- `src/features/products/components/product-card.tsx` → blog card
- `src/components/tables/products/` → posts table

## Token-Efficient Strategy

### Principles
1. **Batch by file** - Write complete files, not incremental edits
2. **Pattern replication** - Study one example, replicate without re-reading
3. **Parallel agents** - Use subagents for independent modules
4. **Defer documentation** - Build first, document during polish
5. **Minimal context** - Group related tasks, clear working memory between phases

---

## Phase 1: Core Feature Module (Foundation)

**Goal:** Create the posts feature structure with all server-side code.

### 1.1 Create Posts Feature Structure
Create all files in one pass:

```
src/features/posts/
├── api/
│   ├── queries.ts    # All read operations
│   └── actions.ts    # All mutations
├── schema.ts         # Zod schemas
└── index.ts          # Re-exports
```

**queries.ts** - All in one file:
- `getLatestPosts(limit)` - Homepage section
- `getPublishedPosts({ page, tag, search })` - Blog list
- `getPostBySlug(slug)` - Single post
- `getRelatedPosts(postId, tagIds)` - Related posts
- `getAllTags()` - Tag list with counts
- `getAdminPosts({ page, status })` - Admin list
- `getPostById(id)` - Admin edit
- `getAdminTags()` - Admin tags
- `getPendingComments()` - Moderation queue

**actions.ts** - All in one file:
- `createPostAction()` - Create draft
- `updatePostAction()` - Update fields
- `publishPostAction()` - Set status
- `unpublishPostAction()` - Revert to draft
- `deletePostAction()` - Remove post
- `togglePostLikeAction()` - Like/unlike
- `submitCommentAction()` - Add comment
- `approveCommentAction()` - Moderate
- `rejectCommentAction()` - Moderate
- `createTagAction()` - Tag CRUD
- `updateTagAction()`
- `deleteTagAction()`

**schema.ts** - All validation:
- `postSchema` - Full post form
- `createPostSchema` - Create input
- `updatePostSchema` - Update input
- `commentSchema` - Comment form
- `tagSchema` - Tag form

### 1.2 Create Like Hook
Single file: `src/hooks/use-like.ts`
- Copy useFavorite, adapt for posts
- `togglePostLikeAction` integration
- Optimistic UI updates

---

## Phase 2: Public Pages (Customer-Facing)

**Goal:** All public blog routes and components.

### 2.1 Blog Components (batch create)
Create directory: `src/features/posts/components/`

**In one batch:**
- `blog-card.tsx` - Post preview card (adapt ProductCard)
- `blog-card-skeleton.tsx` - Loading state
- `blog-grid.tsx` - Grid of cards (adapt ProductsGrid)
- `tag-filter.tsx` - Horizontal tag pills
- `like-button.tsx` - Heart with count
- `share-buttons.tsx` - Social sharing
- `post-header.tsx` - Title, cover, meta
- `post-content.tsx` - TipTap renderer wrapper
- `related-posts.tsx` - Related posts section
- `comments-section.tsx` - Full comments UI
- `comment-item.tsx` - Single comment
- `comment-form.tsx` - Add comment form

### 2.2 Public Routes (batch create)
All routes in sequence:

**`src/app/(public)/blog/page.tsx`**
- Blog list with tag filtering
- Pagination via ShowMore
- generateMetadata for SEO

**`src/app/(public)/blog/[slug]/page.tsx`**
- Single post with full content
- generateMetadata (dynamic from post)
- generateStaticParams (optional)

### 2.3 Homepage Integration
Edit: `src/app/(public)/page.tsx`
- Add HomeBlogSection component
- Uses getLatestPosts(3)

---

## Phase 3: Admin Panel

**Goal:** Complete admin CRUD interface.

### 3.1 Admin Components (batch create)
Create: `src/app/(admin)/admin/blog/posts/_components/`

**In one batch:**
- `posts-table.tsx` + `columns.tsx` - Table view
- `post-form.tsx` - Full edit form
- `status-badge.tsx` - Draft/Published badge
- `seo-fields.tsx` - Meta title/description
- `tag-selector.tsx` - Multi-select tags

Create: `src/app/(admin)/admin/blog/tags/_components/`
- `tags-table.tsx` + `columns.tsx`
- `tag-form.tsx` - Create/edit modal

Create: `src/app/(admin)/admin/blog/comments/_components/`
- `comments-queue.tsx` - Pending list
- `comment-preview.tsx` - Single item

### 3.2 Admin Routes (update stubs)
Fill in existing stub files:

- `/admin/blog/posts/page.tsx` - Posts list
- `/admin/blog/posts/[id]/page.tsx` - Post editor (create new)
- `/admin/blog/tags/page.tsx` - Tags management
- `/admin/blog/comments/page.tsx` - Moderation queue

### 3.3 Navigation Updates
- Admin sidebar: Add Blog section with badge for pending comments
- Main nav: Add Blog link
- Footer: Add Blog link

---

## Phase 4: SEO & Polish

**Goal:** Search optimization and final touches.

### 4.1 SEO Implementation
- JSON-LD Article schema in post page
- OpenGraph meta tags
- Twitter Card meta tags
- Sitemap integration for posts

### 4.2 Performance
- Image optimization (already via next/image)
- Loading skeletons (created in Phase 2)
- Error boundaries

---

## Execution Order (Token-Optimized)

| Order | Phase | Est. Files | Dependencies |
|-------|-------|------------|--------------|
| 1 | 1.1 Feature module | 4 | None |
| 2 | 1.2 Like hook | 1 | 1.1 |
| 3 | 2.1 Components | 12 | 1.1, 1.2 |
| 4 | 2.2 Public routes | 2 | 2.1 |
| 5 | 2.3 Homepage | 1 edit | 2.1 |
| 6 | 3.1 Admin components | 10 | 1.1 |
| 7 | 3.2 Admin routes | 4 | 3.1 |
| 8 | 3.3 Navigation | 3 edits | 3.2 |
| 9 | 4.1-4.2 SEO/Polish | 2 edits | All |

**Total: ~39 file operations** (vs 80+ tasks in original)

---

## Parallel Execution Opportunities

These can run simultaneously via subagents:

**Batch A (Public):** 2.1 + 2.2 + 2.3
**Batch B (Admin):** 3.1 + 3.2

After Phase 1 completes, both batches can proceed in parallel.

---

## Key Files to Reference (Read Once)

Before starting, read these once and keep patterns in memory:

1. `src/features/products/api/queries.ts` - Cache pattern
2. `src/features/products/api/actions.ts` - Action pattern
3. `src/features/favorites/api/actions.ts` - Toggle pattern
4. `src/features/products/components/product-card.tsx` - Card pattern
5. `src/components/tables/products/columns.tsx` - Table pattern
6. `src/app/(admin)/admin/products/[id]/_components/product-form.tsx` - Form pattern

---

## Removed/Deferred from Original Plan

**Removed (not needed):**
- Section 1 (Documentation) - Build first, document later
- Database work - Already complete
- Email notifications - Phase 2 scope

**Simplified:**
- Merged all server actions into single files
- Combined related components into creation batches
- Removed redundant "check existing" tasks (done in exploration)

---

## Implementation Commands

When ready to implement, use this sequence:

```bash
# Phase 1
# Create posts feature with all queries/actions/schemas

# Phase 2 (can parallel with Phase 3)
# Create public components and routes

# Phase 3 (can parallel with Phase 2)
# Create admin components and routes

# Phase 4
# SEO and polish
```

---

## Notes for Implementation

1. **Schema Reference:** `src/db/schema.ts` - posts, postTags, postToTags, postComments, postLikes
2. **ID Prefix:** `post_`, `tag_`, `comment_`, `like_`
3. **Status Enum:** PostStatus = "draft" | "published"
4. **Content Format:** TipTap JSONContent (same as products)
5. **Cache Tags:** "posts", "tags", "comments"
