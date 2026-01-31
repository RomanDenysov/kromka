"use client";

import { CheckIcon, CopyIcon, FacebookIcon, TwitterIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  title: string;
  className?: string;
};

export function ShareButtons({ url, title, className }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Odkaz skopírovaný do schránky");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nepodarilo sa skopírovať odkaz");
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-muted-foreground text-sm">Zdieľať:</span>

      {/* Facebook */}
      <Button
        aria-label="Zdieľať na Facebooku"
        asChild
        size="icon-sm"
        variant="outline"
      >
        <a href={facebookUrl} rel="noopener noreferrer" target="_blank">
          <FacebookIcon className="size-4" />
        </a>
      </Button>

      {/* Twitter/X */}
      <Button
        aria-label="Zdieľať na Twitteri"
        asChild
        size="icon-sm"
        variant="outline"
      >
        <a href={twitterUrl} rel="noopener noreferrer" target="_blank">
          <TwitterIcon className="size-4" />
        </a>
      </Button>

      {/* Copy Link */}
      <Button
        aria-label="Kopírovať odkaz"
        onClick={handleCopyLink}
        size="icon-sm"
        variant="outline"
      >
        {copied ? (
          <CheckIcon className="size-4 text-emerald-500" />
        ) : (
          <CopyIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}
