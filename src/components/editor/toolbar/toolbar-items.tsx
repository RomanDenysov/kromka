import { type Editor, useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { Toggle } from "@/components/ui/toggle";

type ToolbarButtonProps = {
  editor: Editor;
  className?: string;
};

export function BoldButton({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("bold"),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleBold()}
      onPressedChange={() => editor.chain().focus().toggleBold().run()}
      pressed={isActive}
      size="xs"
    >
      <BoldIcon className="size-4" />
      <span className="sr-only">Bold</span>
    </Toggle>
  );
}

export function ItalicButton({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("italic"),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleItalic()}
      onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      pressed={isActive}
      size="xs"
    >
      <ItalicIcon className="size-4" />
      <span className="sr-only">Italic</span>
    </Toggle>
  );
}

export function Heading2Button({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("heading", { level: 2 }),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleHeading({ level: 2 })}
      onPressedChange={() =>
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      }
      pressed={isActive}
      size="xs"
    >
      <Heading2Icon className="size-4" />
      <span className="sr-only">Heading 2</span>
    </Toggle>
  );
}

export function Heading3Button({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("heading", { level: 3 }),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleHeading({ level: 3 })}
      onPressedChange={() =>
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      }
      pressed={isActive}
      size="xs"
    >
      <Heading3Icon className="size-4" />
      <span className="sr-only">Heading 3</span>
    </Toggle>
  );
}

export function Heading4Button({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("heading", { level: 4 }),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleHeading({ level: 4 })}
      onPressedChange={() =>
        editor.chain().focus().toggleHeading({ level: 4 }).run()
      }
      pressed={isActive}
      size="xs"
    >
      <Heading4Icon className="size-4" />
      <span className="sr-only">Heading 4</span>
    </Toggle>
  );
}

export function BulletListButton({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("bulletList"),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleBulletList()}
      onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      pressed={isActive}
      size="xs"
    >
      <ListIcon className="size-4" />
      <span className="sr-only">Bullet List</span>
    </Toggle>
  );
}

export function OrderedListButton({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("orderedList"),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleOrderedList()}
      onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      pressed={isActive}
      size="xs"
    >
      <ListOrderedIcon className="size-4" />
      <span className="sr-only">Ordered List</span>
    </Toggle>
  );
}

export function LinkButton({ editor, className }: ToolbarButtonProps) {
  const isActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive("link"),
  });
  return (
    <Toggle
      className={className}
      disabled={!editor.can().toggleLink()}
      onPressedChange={() => editor.chain().focus().toggleLink().run()}
      pressed={isActive}
      size="xs"
    >
      <LinkIcon className="size-4" />
      <span className="sr-only">Link</span>
    </Toggle>
  );
}

export function ImageButton({ editor, className }: ToolbarButtonProps) {
  return (
    <Toggle
      //   disabled={!editor.can().setImage({ src: "" })}
      //   onPressedChange={() => editor.chain().focus().setImage({ src: "" }).run()}
      className={className}
      pressed={editor.isActive("image")}
      size="xs"
    >
      <ImageIcon className="size-4" />
      <span className="sr-only">Image</span>
    </Toggle>
  );
}

export const TOOLBAR_COMPONENTS: Record<
  string,
  ComponentType<ToolbarButtonProps>
> = {
  bold: BoldButton,
  italic: ItalicButton,
  heading2: Heading2Button,
  heading3: Heading3Button,
  heading4: Heading4Button,
  bulletList: BulletListButton,
  orderedList: OrderedListButton,
  link: LinkButton,
  image: ImageButton,
};
