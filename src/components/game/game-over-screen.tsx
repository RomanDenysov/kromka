"use client";

import { RotateCcw, ShoppingCart, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export function GameOverScreen({
  score,
  highScore,
  onRestart,
}: GameOverScreenProps) {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h3 className="mb-2 font-bold text-xl">Koniec hry!</h3>
        {isNewHighScore && (
          <p className="mb-4 font-medium text-amber-500 text-sm">
            Novy rekord!
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <Trophy className="h-6 w-6 text-amber-500" />
          <span>Skore: {score}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Trophy className="h-4 w-4" />
          <span>Rekord: {highScore}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="gap-2" onClick={onRestart} variant="default">
          <RotateCcw className="h-4 w-4" />
          Znova
        </Button>
        <Button asChild className="gap-2" variant="outline">
          <Link href="/e-shop">
            <ShoppingCart className="h-4 w-4" />
            E-shop
          </Link>
        </Button>
      </div>
    </div>
  );
}
