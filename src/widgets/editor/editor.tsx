"use client";

import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { registerExtensions } from "./extentions/register";
import { Toolbar } from "./toolbar/toolbar";
import type { ToolbarVariant } from "./toolbar/toolbar-config";

type EditorProps = {
  content?: JSONContent | string | null;
  placeholder?: string;
  variant?: ToolbarVariant;
  onChange?: (content: JSONContent) => void;
  onBlur?: () => void;
  className?: string;
  editable?: boolean;
};

export function Editor({
  content,
  placeholder,
  variant = "simple",
  onChange,
  onBlur,
  className,
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: registerExtensions({ placeholder, variant }),
    content,
    editable,
    immediatelyRender: false,
    onBlur,
    onUpdate: ({ editor: editorInstance }) => {
      onChange?.(editorInstance?.getJSON());
    },
  });

  return (
    <div className="rounded-md border border-input bg-background">
      {editable && editor && <Toolbar editor={editor} variant={variant} />}
      <EditorContent
        className={cn(
          "prose prose-sm max-w-none px-3 py-2",
          "focus-within:outline-none",
          className
        )}
        editor={editor}
      />
    </div>
  );
}
