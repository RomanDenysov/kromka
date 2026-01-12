import type { Metadata } from "next";
import { notFound } from "next/navigation";

// TODO: Implement blog feature
// When implemented, add:
// - getPostBySlug query from features/blog/queries.ts
// - JsonLd component with getBlogPostingSchema and getBreadcrumbSchema
// - Full page content with post details
// - generateStaticParams for static generation

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog článok z Pekárne Kromka.",
};

export default function BlogPostPage() {
  // Temporary: Show not found until blog is implemented
  notFound();
}
