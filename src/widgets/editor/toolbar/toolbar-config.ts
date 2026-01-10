export const TOOLBAR_VARIANTS = {
  simple: ["bold", "italic"],
  full: [
    "bold",
    "italic",
    "separator",
    "heading2",
    "heading3",
    "heading4",
    "separator",
    "bulletList",
    "orderedList",
    "separator",
    "link",
    "image",
  ],
} as const;

export type ToolbarVariant = keyof typeof TOOLBAR_VARIANTS;
export type ToolbarItem = (typeof TOOLBAR_VARIANTS)[ToolbarVariant][number];
