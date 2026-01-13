import type { Level } from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

const SIMPLE_HEADING_LEVELS: Level[] = [2, 3, 4] as Level[];
const FULL_HEADING_LEVELS: Level[] = [1, 2, 3, 4, 5, 6] as Level[];

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
      link: false, // Disable Link in StarterKit to avoid duplicate with our custom Link config
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
