"use client";

import { SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { AdminPost, AdminTag } from "@/features/posts/api/queries";
import { PostForm } from "../../_components/post-form";
import { StatusBadge } from "../../_components/status-badge";
import { PostPublishButton } from "./post-publish-button";

type Props = {
  post: AdminPost;
  tags: AdminTag[];
};

export function PostFormContainer({ post, tags }: Props) {
  return (
    <PostForm
      formId="post-form"
      post={post}
      renderFooter={({ isPending }) => (
        <footer className="sticky inset-x-0 bottom-0 z-10 border-t bg-background">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <StatusBadge size="default" status={post.status} />
              {post.author && (
                <span className="text-muted-foreground text-sm">
                  Autor: {post.author.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PostPublishButton postId={post.id} status={post.status} />
              <Button disabled={isPending} form="post-form" type="submit">
                {isPending ? (
                  <>
                    <Spinner />
                    Ukladanie...
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-4" />
                    Uložiť
                  </>
                )}
              </Button>
            </div>
          </div>
        </footer>
      )}
      tags={tags}
    />
  );
}
