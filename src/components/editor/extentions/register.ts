import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

const HEADING_LEVEL_2 = 2;
const HEADING_LEVEL_3 = 3;
const HEADING_LEVEL_4 = 4;
const HEADING_LEVEL_1 = 1;
const HEADING_LEVEL_5 = 5;
const HEADING_LEVEL_6 = 6;

const SIMPLE_HEADING_LEVELS = [
  HEADING_LEVEL_2,
  HEADING_LEVEL_3,
  HEADING_LEVEL_4,
];
const FULL_HEADING_LEVELS = [
  HEADING_LEVEL_1,
  HEADING_LEVEL_2,
  HEADING_LEVEL_3,
  HEADING_LEVEL_4,
  HEADING_LEVEL_5,
  HEADING_LEVEL_6,
];

export function registerExtensions(options?: {
  placeholder?: string;
  variant?: "simple" | "full";
}) {
  const { placeholder, variant = "simple" } = options ?? {};

  const starterKitConfig = {
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
  } as Parameters<typeof StarterKit.configure>[0];

  const extensions: Array<
    | ReturnType<typeof StarterKit.configure>
    | ReturnType<typeof Link.configure>
    | ReturnType<typeof Placeholder.configure>
  > = [
    StarterKit.configure(starterKitConfig),
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
