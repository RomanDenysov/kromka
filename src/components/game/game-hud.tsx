"use client";

import { Heart, Trophy } from "lucide-react";
import { INITIAL_LIVES } from "@/lib/game/constants";

type GameHUDProps = {
  score: number;
  lives: number;
};

export function GameHUD({ score, lives }: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute top-4 right-4 flex items-center gap-4">
      <div className="flex items-center gap-1 rounded-lg bg-black/50 px-3 py-1.5 text-white">
        <Trophy className="h-4 w-4" />
        <span className="font-bold">{score}</span>
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-black/50 px-3 py-1.5">
        {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
          <Heart
            className={`h-4 w-4 ${
              i < lives ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
            key={`heart-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
