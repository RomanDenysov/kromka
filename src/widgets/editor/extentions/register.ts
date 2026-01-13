import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

/** Heading levels supported by TipTap (H1-H6) */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const SIMPLE_HEADING_LEVELS: HeadingLevel[] = [2, 3, 4];
const FULL_HEADING_LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

export function registerExtensions(options?: {
  placeholder?: string;
  variant?: "simple" | "full";
}) {
  const { placeholder, variant = "simple" } = options ?? {};

  const extensions: Array<
    | ReturnType<typeof StarterKit.configure>
    | ReturnType<typeof Link.configure>
    | ReturnType<typeof Placeholder.configure>
  > = [
    StarterKit.configure({
      heading: {
        levels:
          variant === "simple" ? SIMPLE_HEADING_LEVELS : FULL_HEADING_LEVELS,
      },
      ...(variant !== "full" && {
        strike: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
    }),
  ];

  if (placeholder) {
    extensions.push(Placeholder.configure({ placeholder }));
  }

  return extensions;
}
