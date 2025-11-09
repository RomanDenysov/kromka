import Link from "@tiptap/extension-link";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const HEADING_LEVEL_2 = 2;
const HEADING_LEVEL_3 = 3;
const HEADING_LEVEL_4 = 4;

const SIMPLE_HEADING_LEVELS = [
  HEADING_LEVEL_2,
  HEADING_LEVEL_3,
  HEADING_LEVEL_4,
];

/**
 * Convert Tiptap JSONContent to HTML string
 * Useful for SEO, JSON-LD, and meta descriptions
 */
export function jsonContentToHtml(
  content: JSONContent | null | undefined
): string {
  if (!content) {
    return "";
  }

  const extensions = [
    StarterKit.configure({
      heading: {
        levels: SIMPLE_HEADING_LEVELS as [
          typeof HEADING_LEVEL_2,
          typeof HEADING_LEVEL_3,
          typeof HEADING_LEVEL_4,
        ],
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
    }),
  ];

  try {
    return generateHTML(content, extensions);
  } catch {
    return "";
  }
}

/**
 * Convert HTML string to Tiptap JSONContent
 * Useful for loading existing HTML content into the editor
 *
 * Note: This requires an editor instance. For server-side conversion,
 * use the editor's setContent() method with HTML string.
 */
export function htmlToJsonContent(
  html: string | null | undefined
): JSONContent | null {
  if (!html || html.trim() === "") {
    return null;
  }

  // For client-side, you can use editor.setContent(html) which will parse HTML
  // For server-side, you'd need to use a different approach
  // This is a placeholder - actual conversion should be done via editor instance
  // or using a proper HTML parser that understands ProseMirror schema
  return null;
}
