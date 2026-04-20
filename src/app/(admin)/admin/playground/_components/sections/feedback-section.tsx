"use client";

import { FolderOpenIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { PlaygroundSection } from "../playground-section";

export function FeedbackSection() {
  return (
    <PlaygroundSection
      description="Skeleton, Spinner, Progress, Empty."
      id="feedback"
      title="Stav a načítanie"
    >
      <div className="flex flex-col gap-8">
        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Skeleton
          </p>
          <div className="flex max-w-sm flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="mb-2 font-medium text-muted-foreground text-xs">
              Spinner
            </p>
            <Spinner className="size-8" />
          </div>
          <div className="min-w-[200px] flex-1">
            <p className="mb-2 font-medium text-muted-foreground text-xs">
              Progress
            </p>
            <Progress value={42} />
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Empty
          </p>
          <Empty className="min-h-[180px] border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpenIcon />
              </EmptyMedia>
              <EmptyTitle>Žiadne položky</EmptyTitle>
              <EmptyDescription>
                Pridajte prvý záznam alebo zmeňte filter.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      </div>
    </PlaygroundSection>
  );
}
