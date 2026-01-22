# Blog Section Implementation Plan

## Overview

Implement blog functionality for Kromka bakery e-commerce platform. This includes public blog pages with posts, tags, and comments, plus admin panel for content management. The blog will support SEO optimization and community engagement through comments and likes.

## Architecture Context

### Existing Database Schema (Already Complete)
- `posts` — Blog posts with TipTap JSON content, SEO fields, status (draft/published)
- `postTags` — Tag definitions (name, slug)
- `postToTags` — Many-to-many relation posts ↔ tags
- `postComments` — Nested comments with moderation (isPublished flag)
- `postLikes` — User likes on posts
- `users.posts` relation — Author relationship

### Key Fields in Posts Table
- `title`, `slug` — Post identification
- `excerpt` — Short preview text
- `content` — TipTap JSONContent (same format as products)
- `coverImageId` — Featured image (references media)
- `status` — 'draft' | 'published'
- `publishedAt` — Publication timestamp
- `metaTitle`, `metaDescription` — SEO fields
- `likesCount`, `commentsCount` — Denormalized counters

---

## Task Tree

### 1. Documentation & Architecture

#### 1.1 Create Blog Architecture Documentation
> Document the blog system architecture, content flow, and component relationships.

- [ ] **1.1.1** Create blog system overview diagram
  > Mermaid diagram showing: Posts → Tags, Posts → Comments → Replies, Posts → Likes, Posts → Author

- [ ] **1.1.2** Document content creation workflow
  > Flow: Create draft → Edit with TipTap → Preview → Publish → Update

- [ ] **1.1.3** Document public blog user journey
  > Journey: Homepage section → Blog list → Single post → Comments/Likes

- [ ] **1.1.4** Create API/Server Actions specification
  > List all server actions for blog with input/output types

- [ ] **1.1.5** Document SEO strategy for blog
  > Meta tags, structured data (JSON-LD), sitemap integration

---

### 2. Public Pages (Main Website)

#### 2.1 Blog Section on Homepage
> Display latest blog posts on the main homepage.

- [ ] **2.1.1** Check existing homepage structure and card components
  > Search for card components, grid layouts on homepage

- [ ] **2.1.2** Create server action `getLatestPosts`
  > Fetch 3 most recent published posts with cover image, excerpt

- [ ] **2.1.3** Create BlogPostCard component
  > Card with: cover image, title, excerpt, date, read time estimate

- [ ] **2.1.4** Create HomeBlogSection component
  > Section title, 3-card grid, "View all" link to /blog

- [ ] **2.1.5** Integrate blog section into homepage
  > Add section in appropriate position on homepage

#### 2.2 Blog List Page
> Main blog page with all posts, filtering, and pagination.

- [ ] **2.2.1** Check existing list/grid page patterns
  > Search for product listing, pagination components

- [ ] **2.2.2** Create route `/blog/page.tsx`
  > Blog list page with SEO metadata

- [ ] **2.2.3** Create server action `getPublishedPosts`
  > Fetch published posts with pagination, tag filter, search

- [ ] **2.2.4** Create server action `getAllTags`
  > Fetch all tags with post counts

- [ ] **2.2.5** Create BlogListHeader component
  > Page title, description, optional search input

- [ ] **2.2.6** Create TagFilter component
  > Horizontal scrollable tag pills for filtering

- [ ] **2.2.7** Create BlogPostGrid component
  > Responsive grid of BlogPostCard components

- [ ] **2.2.8** Create/reuse Pagination component
  > Page navigation for blog posts

- [ ] **2.2.9** Implement tag filtering via URL params
  > `/blog?tag=recipes` pattern with proper state management

#### 2.3 Single Post Page
> Individual blog post with full content, author info, and engagement.

- [ ] **2.3.1** Check existing content display components
  > Search for TipTap renderer, prose styling

- [ ] **2.3.2** Create route `/blog/[slug]/page.tsx`
  > Single post page with dynamic metadata

- [ ] **2.3.3** Create server action `getPostBySlug`
  > Fetch post with author, tags, like count, comments

- [ ] **2.3.4** Create generateMetadata for SEO
  > Dynamic meta tags from post metaTitle, metaDescription, cover image

- [ ] **2.3.5** Create PostHeader component
  > Title, cover image, author info, date, read time, tags

- [ ] **2.3.6** Create/reuse TipTapRenderer component
  > Render TipTap JSON content to HTML (check if exists for products)

- [ ] **2.3.7** Create PostContent component
  > Styled prose container for rendered content

- [ ] **2.3.8** Create PostAuthorCard component
  > Author avatar, name, bio (if available)

- [ ] **2.3.9** Create PostTags component
  > Tag pills linking to filtered blog list

- [ ] **2.3.10** Create ShareButtons component
  > Social sharing buttons (Facebook, Twitter, copy link)

- [ ] **2.3.11** Create RelatedPosts component
  > 2-3 related posts based on tags

#### 2.4 Post Engagement (Likes)
> Allow logged-in users to like posts.

- [ ] **2.4.1** Check existing like/favorite functionality
  > Search for product favorites implementation

- [ ] **2.4.2** Create server action `togglePostLike`
  > Add/remove like, update likesCount on post

- [ ] **2.4.3** Create server action `checkUserLikedPost`
  > Check if current user liked the post

- [ ] **2.4.4** Create LikeButton component
  > Heart icon with count, optimistic UI update

- [ ] **2.4.5** Integrate LikeButton into post page
  > Add near post header or after content

#### 2.5 Comments Section
> Display and submit comments on posts.

- [ ] **2.5.1** Check existing comment or form components
  > Search for comment UI patterns, textarea components

- [ ] **2.5.2** Create server action `getPostComments`
  > Fetch published comments with nested replies, user info

- [ ] **2.5.3** Create server action `submitComment`
  > Create comment (isPublished: false for moderation), update commentsCount

- [ ] **2.5.4** Create server action `submitReply`
  > Create nested reply to existing comment

- [ ] **2.5.5** Create CommentForm component
  > Textarea with submit button, login prompt if not authenticated

- [ ] **2.5.6** Create CommentItem component
  > Single comment with: avatar, name, date, content, reply button

- [ ] **2.5.7** Create CommentReplies component
  > Nested replies under parent comment

- [ ] **2.5.8** Create CommentsSection component
  > Container with comment count, form, and comments list

- [ ] **2.5.9** Add "pending moderation" message after submission
  > Inform user their comment will appear after approval

---

### 3. Admin Panel

#### 3.1 Posts Management
> Admin interface to create, edit, and manage blog posts.

- [ ] **3.1.1** Check existing admin CRUD patterns
  > Search for product editing, TipTap usage in admin

- [ ] **3.1.2** Create route `/admin/blog/posts/page.tsx`
  > Posts list page

- [ ] **3.1.3** Create server action `getAdminPosts`
  > Fetch all posts with filters (status, author, date), pagination

- [ ] **3.1.4** Create PostsTable component
  > Table with: Title, Author, Status, Published Date, Likes, Comments, Actions

- [ ] **3.1.5** Create PostStatusBadge component
  > Visual badge for draft/published status

- [ ] **3.1.6** Create server action `createPost`
  > Create new post with default values (draft status)

- [ ] **3.1.7** Create "New Post" button with action
  > Creates draft and redirects to editor

- [ ] **3.1.8** Create route `/admin/blog/posts/[id]/page.tsx`
  > Post editor page

- [ ] **3.1.9** Create server action `getPostById`
  > Fetch single post with all fields for editing

- [ ] **3.1.10** Create server action `updatePost`
  > Update post fields (autosave support)

- [ ] **3.1.11** Create server action `publishPost`
  > Set status to published, set publishedAt timestamp

- [ ] **3.1.12** Create server action `unpublishPost`
  > Set status back to draft

- [ ] **3.1.13** Create server action `deletePost`
  > Delete post (soft delete or hard delete?)

- [ ] **3.1.14** Create PostEditorForm component
  > Form with: title, slug, excerpt, cover image picker, SEO fields

- [ ] **3.1.15** Integrate/reuse TipTap editor for content
  > Same editor as used for product descriptions

- [ ] **3.1.16** Create CoverImagePicker component
  > Media library integration for selecting cover image

- [ ] **3.1.17** Create TagSelector component
  > Multi-select for assigning tags to post

- [ ] **3.1.18** Create SEOFields component
  > Inputs for metaTitle, metaDescription with character counts

- [ ] **3.1.19** Create PostPreview component/modal
  > Preview how post will look when published

- [ ] **3.1.20** Create publish/unpublish actions in editor
  > Buttons with confirmation for status changes

- [ ] **3.1.21** Implement autosave functionality
  > Debounced save on changes (check existing autosave patterns)

#### 3.2 Tags Management
> Manage blog post tags.

- [ ] **3.2.1** Check existing tag/category management UI
  > Search for category management patterns

- [ ] **3.2.2** Create route `/admin/blog/tags/page.tsx`
  > Tags list page

- [ ] **3.2.3** Create server action `getAdminTags`
  > Fetch all tags with post counts

- [ ] **3.2.4** Create TagsTable component
  > Table with: Name, Slug, Posts Count, Actions

- [ ] **3.2.5** Create server action `createTag`
  > Create new tag, auto-generate slug

- [ ] **3.2.6** Create server action `updateTag`
  > Update tag name/slug

- [ ] **3.2.7** Create server action `deleteTag`
  > Delete tag (handle posts with this tag)

- [ ] **3.2.8** Create TagForm component
  > Modal or inline form for create/edit tag

#### 3.3 Comments Moderation
> Moderate user comments before publication.

- [ ] **3.3.1** Check existing moderation UI patterns
  > Search for review moderation, approval workflows

- [ ] **3.3.2** Create route `/admin/blog/comments/page.tsx`
  > Comments moderation queue

- [ ] **3.3.3** Create server action `getPendingComments`
  > Fetch comments where isPublished = false

- [ ] **3.3.4** Create server action `approveComment`
  > Set isPublished = true, update post commentsCount

- [ ] **3.3.5** Create server action `rejectComment`
  > Delete comment or mark as rejected

- [ ] **3.3.6** Create CommentsQueue component
  > List of pending comments with post context, approve/reject buttons

- [ ] **3.3.7** Create CommentPreview component
  > Show comment content with link to parent post

- [ ] **3.3.8** Add pending comments count to admin dashboard
  > Badge or counter showing moderation queue size

---

### 4. Navigation & Integration

#### 4.1 Admin Navigation
> Add Blog section to admin sidebar.

- [ ] **4.1.1** Check existing admin navigation structure
  > Find admin sidebar/menu component

- [ ] **4.1.2** Add Blog section to admin navigation
  > Menu group: Blog with items: Posts, Tags, Comments (with pending count badge)

#### 4.2 Main Site Navigation
> Add Blog link to main navigation.

- [ ] **4.2.1** Check existing main navigation
  > Find header/nav component

- [ ] **4.2.2** Add Blog link to main navigation
  > Link to /blog in primary navigation

#### 4.3 Footer Integration
> Add blog links to footer if applicable.

- [ ] **4.3.1** Check existing footer structure
  > Find footer component

- [ ] **4.3.2** Add Blog link to footer navigation
  > Include in site links section

---

### 5. SEO & Performance

#### 5.1 SEO Implementation
> Optimize blog for search engines.

- [ ] **5.1.1** Create JSON-LD structured data for posts
  > Article schema with author, date, image

- [ ] **5.1.2** Create sitemap generation for blog posts
  > Add published posts to sitemap.xml

- [ ] **5.1.3** Implement Open Graph meta tags
  > og:title, og:description, og:image for social sharing

- [ ] **5.1.4** Implement Twitter Card meta tags
  > twitter:card, twitter:title, etc.

#### 5.2 Performance Optimization
> Ensure blog pages load efficiently.

- [ ] **5.2.1** Implement image optimization for cover images
  > Use Next.js Image component with proper sizing

- [ ] **5.2.2** Implement static generation for published posts
  > generateStaticParams for popular posts

- [ ] **5.2.3** Add loading states for dynamic content
  > Skeletons for comments, related posts

---

### 6. Email Notifications (Optional)

#### 6.1 Comment Notifications
> Notify relevant parties about new comments.

- [ ] **6.1.1** Check existing email infrastructure
  > Search for email sending setup

- [ ] **6.1.2** Create email template for new comment notification
  > Notify admin about new comment pending moderation

- [ ] **6.1.3** Create email template for comment approved
  > Notify commenter their comment was published (optional)

---

## Dependencies & Notes

### Existing Components to Leverage
- TipTap editor (used for product descriptions)
- Media library (for cover images)
- User authentication (for likes, comments)
- Autosave patterns (if exists in admin)

### External Dependencies
- TipTap renderer (may need @tiptap/react for read-only rendering)
- Date formatting library (date-fns or similar)

### Testing Considerations
- Test post creation and publishing flow
- Test comment moderation workflow
- Test like functionality with optimistic updates
- Test SEO meta tags render correctly
- Test pagination and tag filtering

### Future Enhancements (Out of Scope)
- RSS feed generation
- Newsletter subscription integration
- Post scheduling (publish at future date)
- Reading time analytics
- Content recommendations based on user behavior
- Rich embeds (YouTube, Twitter) in TipTap content
