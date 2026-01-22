"use client";

import { Play } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameSprites } from "@/hooks/game/use-game-sprites";
import type { GameState } from "@/lib/game/types";
import { BakerGame, type BakerGameRef } from "./baker-game";
import { GameLoadingState } from "./game-loading-state";
import { GameOverScreen } from "./game-over-screen";

function IdleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="text-center">
        <h3 className="mb-1 font-bold text-xl">Pekar Matej</h3>
        <p className="text-muted-foreground text-sm">Klikni pre hru!</p>
      </div>
      <Button className="gap-2" onClick={onStart} size="lg">
        <Play className="h-5 w-5" />
        Hrat
      </Button>
    </div>
  );
}

export function GameCard() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameRef = useRef<BakerGameRef>(null);
  const { sprites, loading, error } = useGameSprites();

  const handleStart = useCallback(() => {
    setGameState("playing");
  }, []);

  const handleGameOver = useCallback((score: number, newHighScore: number) => {
    setFinalScore(score);
    setHighScore(newHighScore);
    setGameState("gameover");
  }, []);

  const handleRestart = useCallback(() => {
    gameRef.current?.reset();
    setGameState("playing");
  }, []);

  if (error) {
    return (
      <Card className="aspect-video w-full max-w-3xl">
        <CardContent className="flex h-full items-center justify-center p-6">
          <p className="text-destructive">Nepodarilo sa nacitat hru</p>
        </CardContent>
      </Card>
    );
  }

  const renderContent = () => {
    if (loading) {
      return <GameLoadingState />;
    }

    if (gameState === "idle") {
      return <IdleScreen onStart={handleStart} />;
    }

    if (gameState === "playing" && sprites) {
      return (
        <BakerGame
          onGameOver={handleGameOver}
          ref={gameRef}
          sprites={sprites}
        />
      );
    }

    if (gameState === "gameover") {
      return (
        <GameOverScreen
          highScore={highScore}
          onRestart={handleRestart}
          score={finalScore}
        />
      );
    }

    return null;
  };

  return (
    <Card className="aspect-video w-full max-w-3xl overflow-hidden">
      <CardContent className="relative h-full p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
