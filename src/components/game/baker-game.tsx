"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useGameControls } from "@/hooks/game/use-game-controls";
import { useGameLoop } from "@/hooks/game/use-game-loop";
import {
  BAKER_HEIGHT,
  BAKER_WIDTH,
  BAKER_Y_OFFSET,
  CATCH_ANIMATION_DURATION,
  GAME_HEIGHT,
  GAME_WIDTH,
  HIGH_SCORE_KEY,
  INITIAL_LIVES,
} from "@/lib/game/constants";
import { checkBakerItemCollision } from "@/lib/game/physics";
import {
  getItemPoints,
  getOvens,
  getRandomSpawnInterval,
  itemLosesLife,
  spawnItem,
} from "@/lib/game/spawner";
import type { Baker, FallingItem, GameSprites, Oven } from "@/lib/game/types";
import { GameHUD } from "./game-hud";

type BakerGameProps = {
  sprites: GameSprites;
  onGameOver: (score: number, highScore: number) => void;
};

export type BakerGameRef = {
  reset: () => void;
};

export const BakerGame = forwardRef<BakerGameRef, BakerGameProps>(
  function BakerGameComponent({ sprites, onGameOver }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [isPlaying, setIsPlaying] = useState(true);

    const bakerRef = useRef<Baker>({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - BAKER_HEIGHT - BAKER_Y_OFFSET,
      width: BAKER_WIDTH,
      height: BAKER_HEIGHT,
      isCatching: false,
      catchTimeout: null,
    });

    const itemsRef = useRef<FallingItem[]>([]);
    const ovensRef = useRef<Oven[]>(getOvens());
    const scoreRef = useRef(0);
    const livesRef = useRef(INITIAL_LIVES);
    const spawnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const highScoreRef = useRef(0);

    useEffect(() => {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        highScoreRef.current = Number.parseInt(stored, 10) || 0;
      }
    }, []);

    const resetGame = useCallback(() => {
      bakerRef.current = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - BAKER_HEIGHT - BAKER_Y_OFFSET,
        width: BAKER_WIDTH,
        height: BAKER_HEIGHT,
        isCatching: false,
        catchTimeout: null,
      };
      itemsRef.current = [];
      scoreRef.current = 0;
      livesRef.current = INITIAL_LIVES;
      setScore(0);
      setLives(INITIAL_LIVES);
      setIsPlaying(true);
    }, []);

    useImperativeHandle(ref, () => ({
      reset: resetGame,
    }));

    const handleMove = useCallback((updater: (prev: number) => number) => {
      bakerRef.current.x = updater(bakerRef.current.x);
    }, []);

    useGameControls({
      onMove: handleMove,
      enabled: isPlaying,
      containerRef,
    });

    const scheduleSpawn = useCallback(() => {
      if (!isPlaying) return;

      const interval = getRandomSpawnInterval();
      spawnTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          const newItem = spawnItem(ovensRef.current, scoreRef.current);
          itemsRef.current.push(newItem);
          scheduleSpawn();
        }
      }, interval);
    }, [isPlaying]);

    useEffect(() => {
      if (isPlaying) {
        scheduleSpawn();
      }

      return () => {
        if (spawnTimeoutRef.current) {
          clearTimeout(spawnTimeoutRef.current);
        }
      };
    }, [isPlaying, scheduleSpawn]);

    const triggerCatchAnimation = useCallback(() => {
      const baker = bakerRef.current;
      if (baker.catchTimeout) {
        clearTimeout(baker.catchTimeout);
      }
      baker.isCatching = true;
      baker.catchTimeout = setTimeout(() => {
        baker.isCatching = false;
        baker.catchTimeout = null;
      }, CATCH_ANIMATION_DURATION);
    }, []);

    const triggerHapticFeedback = useCallback(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, []);

    const endGame = useCallback(() => {
      setIsPlaying(false);

      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }

      const finalScore = scoreRef.current;
      let finalHighScore = highScoreRef.current;

      if (finalScore > finalHighScore) {
        finalHighScore = finalScore;
        highScoreRef.current = finalScore;
        localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
      }

      onGameOver(finalScore, finalHighScore);
    }, [onGameOver]);

    const handleItemCatch = useCallback(
      (item: FallingItem, items: FallingItem[], index: number) => {
        const points = getItemPoints(item.type);
        scoreRef.current = Math.max(0, scoreRef.current + points);
        setScore(scoreRef.current);

        if (points > 0) {
          triggerCatchAnimation();
        } else {
          triggerHapticFeedback();
        }

        items.splice(index, 1);
      },
      [triggerCatchAnimation, triggerHapticFeedback]
    );

    const handleItemMiss = useCallback(
      (item: FallingItem, items: FallingItem[], index: number): boolean => {
        if (itemLosesLife(item.type)) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          triggerHapticFeedback();

          if (livesRef.current <= 0) {
            endGame();
            return true;
          }
        }
        items.splice(index, 1);
        return false;
      },
      [triggerHapticFeedback, endGame]
    );

    const onUpdate = useCallback(
      (deltaTime: number) => {
        const baker = bakerRef.current;
        const items = itemsRef.current;
        const normalizedDelta = deltaTime / 16.67;

        for (let i = items.length - 1; i >= 0; i -= 1) {
          const item = items[i];
          item.y += item.speed * normalizedDelta;

          if (checkBakerItemCollision(baker, item)) {
            handleItemCatch(item, items, i);
            continue;
          }

          if (item.y > GAME_HEIGHT + item.height) {
            const gameEnded = handleItemMiss(item, items, i);
            if (gameEnded) return;
          }
        }
      },
      [handleItemCatch, handleItemMiss]
    );

    const onRender = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      for (const oven of ovensRef.current) {
        ctx.drawImage(sprites.oven, oven.x, oven.y, oven.width, oven.height);
      }

      for (const item of itemsRef.current) {
        const sprite = sprites[item.type];
        ctx.drawImage(
          sprite,
          item.x - item.width / 2,
          item.y - item.height / 2,
          item.width,
          item.height
        );
      }

      const baker = bakerRef.current;
      const bakerSprite = baker.isCatching
        ? sprites.matej_catch
        : sprites.matej_run;
      ctx.drawImage(
        bakerSprite,
        baker.x - baker.width / 2,
        baker.y,
        baker.width,
        baker.height
      );
    }, [sprites]);

    useGameLoop({
      onUpdate,
      onRender,
      enabled: isPlaying,
    });

    return (
      <div
        className="relative h-full w-full touch-none select-none"
        ref={containerRef}
        tabIndex={0}
      >
        <canvas
          className="h-full w-full"
          height={GAME_HEIGHT}
          ref={canvasRef}
          style={{ imageRendering: "pixelated" }}
          width={GAME_WIDTH}
        />
        <GameHUD lives={lives} score={score} />
      </div>
    );
  }
);
