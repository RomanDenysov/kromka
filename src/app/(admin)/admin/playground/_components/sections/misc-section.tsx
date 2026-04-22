"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MapPlayground } from "../map-playground";
import { PlaygroundSection } from "../playground-section";

const SCROLL_LINES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function MiscSection() {
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <PlaygroundSection
      description="Avatar, Calendar, Carousel, Scroll area, Separator, Sonner (toast), Map. Sidebar komponenty sú v admin rozhraní okolo tejto stránky."
      id="misc"
      title="Ostatné"
    >
      <div className="flex flex-col gap-10">
        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Avatar
          </p>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage alt="Ukážka" src="https://github.com/shadcn.png" />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>PK</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Calendar
          </p>
          <Calendar mode="single" onSelect={setDate} selected={date} />
        </div>

        <div className="max-w-md">
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Carousel
          </p>
          <Carousel className="w-full">
            <CarouselContent>
              {["Slide 1", "Slide 2", "Slide 3"].map((label) => (
                <CarouselItem key={label}>
                  <div className="flex h-32 items-center justify-center rounded-md border bg-muted p-4">
                    <span className="font-medium text-lg">{label}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </Carousel>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Scroll area
          </p>
          <ScrollArea className="h-32 w-full max-w-md rounded-md border p-3">
            <div className="space-y-2 pr-4 text-sm">
              {SCROLL_LINES.map((line) => (
                <p key={line}>Riadok obsahu {line} — posúvajte zvislo.</p>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Separator
          </p>
          <div className="flex max-w-md items-center gap-2 text-sm">
            <span>Vľavo</span>
            <Separator className="flex-1" orientation="horizontal" />
            <span>Vpravo</span>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Sonner
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => toast.success("Uložené")}
              type="button"
              variant="outline"
            >
              Toast úspech
            </Button>
            <Button
              onClick={() => toast.error("Niečo zlyhalo")}
              type="button"
              variant="outline"
            >
              Toast chyba
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Map (MapLibre + dlaždice)
          </p>
          <MapPlayground />
        </div>

        <div className="rounded-md border bg-muted/30 p-4 text-muted-foreground text-sm">
          <p className="font-medium text-foreground">Sidebar</p>
          <p className="mt-1">
            Komponenty z{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              @/components/ui/sidebar
            </code>{" "}
            tvoria ľavé admin menu — celý kontext vidíte na tejto stránke okolo
            obsahu.
          </p>
        </div>
      </div>
    </PlaygroundSection>
  );
}
