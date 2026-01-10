"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BubbleMenuItem } from "./bubble-menu-item";

type LinkItemProps = {
  editor: Editor;
};

function LinkItem({ editor }: LinkItemProps) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  const handleSetLink = () => {
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setOpen(false);
    setUrl("");
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setOpen(false);
    setUrl("");
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="h-8 rounded-none border-0 border-border border-r last:rounded-r-full last:border-r-0"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href;
            setUrl(previousUrl || "");
            setOpen(true);
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Link2 className="size-4" />
          <span className="sr-only">Link</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex flex-col gap-2">
          <Input
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSetLink();
              }
            }}
            placeholder="Enter URL"
            type="url"
            value={url}
          />
          <div className="flex gap-2">
            <Button onClick={handleSetLink} size="sm" type="button">
              Set Link
            </Button>
            {editor.isActive("link") && (
              <Button
                onClick={handleRemoveLink}
                size="sm"
                type="button"
                variant="destructive"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function BubbleMenu({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  return (
    <TiptapBubbleMenu editor={editor}>
      <div className="flex w-fit max-w-[90vw] overflow-hidden rounded-full border border-border bg-background">
        <BubbleMenuItem
          action={() => editor.chain().focus().toggleBold().run()}
          editor={editor}
          isActive={editor.isActive("bold")}
        >
          <Bold className="size-4" />
          <span className="sr-only">Bold</span>
        </BubbleMenuItem>

        <BubbleMenuItem
          action={() => editor.chain().focus().toggleItalic().run()}
          editor={editor}
          isActive={editor.isActive("italic")}
        >
          <Italic className="size-4" />
          <span className="sr-only">Italic</span>
        </BubbleMenuItem>

        <BubbleMenuItem
          action={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          editor={editor}
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="size-4" />
          <span className="sr-only">Heading 2</span>
        </BubbleMenuItem>

        <BubbleMenuItem
          action={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          editor={editor}
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="size-4" />
          <span className="sr-only">Heading 3</span>
        </BubbleMenuItem>

        <BubbleMenuItem
          action={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          editor={editor}
          isActive={editor.isActive("heading", { level: 4 })}
        >
          <Heading4 className="size-4" />
          <span className="sr-only">Heading 4</span>
        </BubbleMenuItem>

        <LinkItem editor={editor} />
      </div>
    </TiptapBubbleMenu>
  );
}
