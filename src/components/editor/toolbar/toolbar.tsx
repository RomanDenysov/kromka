import type { Editor } from "@tiptap/react";
import { Separator } from "@/components/ui/separator";
import { TOOLBAR_VARIANTS, type ToolbarVariant } from "./toolbar-config";
import { TOOLBAR_COMPONENTS } from "./toolbar-items";

type Props = {
  editor: Editor;
  variant: ToolbarVariant;
};

export function Toolbar({ editor, variant }: Props) {
  const items = TOOLBAR_VARIANTS[variant];

  return (
    <div className="flex items-center gap-0.5 border-b p-1">
      {items.map((item, index) => {
        if (item === "separator") {
          return (
            <Separator
              className="mx-1 h-6"
              key={`separator-${index.toString()}`}
              orientation="vertical"
            />
          );
        }

        const Component = TOOLBAR_COMPONENTS[item];
        if (!Component) {
          return null;
        }

        return (
          <Component
            editor={editor}
            key={`toolbar-button-${item}-${index.toString()}`}
          />
        );
      })}
    </div>
  );
}
