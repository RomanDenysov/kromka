"use client";

import { RotateCcw, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GAME_HEIGHT, GAME_WIDTH } from "@/lib/game/constants";
import type { GameSprites } from "@/lib/game/types";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  sprites: GameSprites;
}

export function GameOverScreen({
  score,
  highScore,
  onRestart,
  sprites,
}: GameOverScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isNewHighScore = score >= highScore && score > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background image (already loaded)
    ctx.drawImage(sprites.game_over, 0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw score with outlined text for visibility
    ctx.textAlign = "center";

    // New high score indicator
    if (isNewHighScore) {
      ctx.font = "bold 20px monospace";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 4;
      ctx.strokeText("Nový rekord!", GAME_WIDTH / 2, 120);
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("Nový rekord!", GAME_WIDTH / 2, 120);
    }

    // Main score
    ctx.font = "bold 36px monospace";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.strokeText(`Skóre: ${score}`, GAME_WIDTH / 2, 160);
    ctx.fillStyle = "#fff";
    ctx.fillText(`Skóre: ${score}`, GAME_WIDTH / 2, 160);

    // High score
    ctx.font = "bold 18px monospace";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeText(`Rekord: ${highScore}`, GAME_WIDTH / 2, 195);
    ctx.fillStyle = "#d1d5db";
    ctx.fillText(`Rekord: ${highScore}`, GAME_WIDTH / 2, 195);
  }, [score, highScore, isNewHighScore, sprites]);

  return (
    <div className="relative h-full w-full">
      <canvas
        className="h-full w-full"
        height={GAME_HEIGHT}
        ref={canvasRef}
        style={{ imageRendering: "pixelated" }}
        width={GAME_WIDTH}
      />
      <div className="absolute inset-x-0 bottom-8 flex justify-center gap-3">
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
