"use client";

import { Heart, HelpCircle, Pause, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { INITIAL_LIVES } from "@/lib/game/constants";

type GameHUDProps = {
  score: number;
  lives: number;
  onPause: () => void;
};

export function GameHUD({ score, lives, onPause }: GameHUDProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Help button - top left */}
      <div className="absolute top-4 left-4">
        <Button
          className="bg-black/60 text-white hover:bg-black/80"
          onClick={() => setShowHelp(true)}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <HelpCircle className="size-6" />
        </Button>
      </div>

      {/* HUD - top right */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <Button
          className="bg-black/60 text-white hover:bg-black/80"
          onClick={onPause}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <Pause className="size-6" />
        </Button>

        <div className="pointer-events-none flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2.5 text-white">
          <Trophy className="size-6 text-amber-400" />
          <span className="font-bold text-lg tabular-nums">{score}</span>
        </div>

        <div className="pointer-events-none flex items-center gap-1.5 rounded-lg bg-black/60 px-4 py-2.5">
          {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
            <Heart
              className={`size-6 ${
                i < lives ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
              key={`heart-${i}`}
            />
          ))}
        </div>
      </div>

      {/* Help dialog */}
      <Dialog onOpenChange={setShowHelp} open={showHelp}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Ako hrat hru
            </DialogTitle>
            <DialogDescription className="text-center">
              Chytaj padajuce pecivo a zbieraj body!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Controls section */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Ovladanie</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⌨️</span>
                  <span>Klavesnica:</span>
                  <Kbd>←</Kbd> <Kbd>→</Kbd>
                  <span className="text-muted-foreground">alebo</span>
                  <Kbd>A</Kbd> <Kbd>D</Kbd>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🖱️</span>
                  <span>Mys: klikni a tahaj pekarom</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏸️</span>
                  <span>Pauza:</span>
                  <Kbd>Esc</Kbd>
                  <span className="text-muted-foreground">alebo</span>
                  <Kbd>P</Kbd>
                </div>
              </div>
            </div>

            {/* Scoring section */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Bodovanie</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 dark:bg-green-950/30">
                  <span className="text-lg">🍞</span>
                  <span>Chlieb</span>
                  <span className="ml-auto font-bold text-green-600">+1</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 dark:bg-green-950/30">
                  <span className="text-lg">🥖</span>
                  <span>Bageta</span>
                  <span className="ml-auto font-bold text-green-600">+2</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2 dark:bg-amber-950/30">
                  <span className="text-lg">🥐</span>
                  <span>Croissant</span>
                  <span className="ml-auto font-bold text-amber-600">+10</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 dark:bg-red-950/30">
                  <span className="text-lg">🔥</span>
                  <span>Spalene</span>
                  <span className="ml-auto font-bold text-red-600">−5</span>
                </div>
              </div>
            </div>

            {/* Lives section */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Zivoty</h4>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex gap-0.5">
                  <Heart className="size-5 fill-red-500 text-red-500" />
                  <Heart className="size-5 fill-red-500 text-red-500" />
                  <Heart className="size-5 fill-red-500 text-red-500" />
                </div>
                <span>
                  Mas 3 zivoty. Kazde spadnute pecivo{" "}
                  <span className="font-medium text-red-600">−1 zivot</span>
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => setShowHelp(false)}
              size="lg"
            >
              Rozumiem, hrajme!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
