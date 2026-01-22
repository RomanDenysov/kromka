"use client";

import type { JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Props = {
  content: JSONContent | null;
  className?: string;
};

// TipTap extensions for rendering
const extensions = [
  StarterKit,
  TiptapLink.configure({
    openOnClick: false,
  }),
  TiptapImage,
];

export function PostContent({ content, className }: Props) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      // TipTap's generateHTML produces sanitized output from the trusted JSON schema
      // The content is stored as structured JSON and is admin-controlled
      return generateHTML(content, extensions);
    } catch {
      return "";
    }
  }, [content]);

  if (!html) {
    return null;
  }

  return (
    <article
      className={cn(
        // Prose styles for blog content
        "prose prose-neutral dark:prose-invert max-w-none",
        // Headings
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
        // Paragraphs
        "prose-p:text-base prose-p:leading-relaxed",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Lists
        "prose-ul:my-4 prose-ol:my-4 prose-li:my-1",
        // Images
        "prose-img:rounded-lg prose-img:my-8",
        // Code
        "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal",
        "prose-pre:bg-muted prose-pre:rounded-lg",
        // Blockquotes
        "prose-blockquote:border-l-primary prose-blockquote:not-italic",
        className
      )}
      // TipTap generateHTML converts trusted admin-created JSON to HTML
      // Content is stored as structured JSONContent schema, not raw user HTML
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Admin-controlled TipTap JSON content
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
