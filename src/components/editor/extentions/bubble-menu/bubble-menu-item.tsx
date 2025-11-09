"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BubbleMenuItemProps = {
  editor: Editor;
  action: () => void;
  isActive?: boolean;
  children: React.ReactNode;
};

export function BubbleMenuItem({
  editor,
  action,
  isActive,
  children,
}: BubbleMenuItemProps) {
  if (!editor) {
    return null;
  }

  return (
    <Button
      className={cn(
        "h-8 rounded-none border-0 border-border border-r first:rounded-l-full last:rounded-r-full last:border-r-0",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={action}
      size="sm"
      type="button"
      variant="ghost"
    >
      {children}
    </Button>
  );
}
