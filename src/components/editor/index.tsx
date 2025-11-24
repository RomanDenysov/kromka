"use client";

import {
  EditorContent,
  type Editor as EditorInstance,
  type JSONContent,
  useEditor,
} from "@tiptap/react";
import { BubbleMenu } from "./extentions/bubble-menu";
import { registerExtensions } from "./extentions/register";

type EditorProps = {
  content?: JSONContent | string;
  placeholder?: string;
  variant?: "simple" | "full";
  onUpdate?: (editor: EditorInstance) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
  tabIndex?: number;
  editable?: boolean;
};

export function Editor({
  content,
  placeholder,
  variant = "simple",
  onUpdate,
  onBlur,
  onFocus,
  className,
  tabIndex,
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: registerExtensions({ placeholder, variant }),
    content,
    editable,
    immediatelyRender: false,
    onBlur,
    onFocus,
    onUpdate: ({ editor: editorInstance }) => {
      onUpdate?.(editorInstance);
    },
  });

  return (
    <>
      <EditorContent
        className={className}
        editor={editor}
        tabIndex={tabIndex}
      />
      <BubbleMenu editor={editor} />
    </>
  );
}
