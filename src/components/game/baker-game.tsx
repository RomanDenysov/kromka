"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGameControls } from "@/hooks/game/use-game-controls";
import { useGameLoop } from "@/hooks/game/use-game-loop";
import {
  BAKER_HEIGHT,
  BAKER_SPEED,
  BAKER_WIDTH,
  BAKER_Y_OFFSET,
  CATCH_ANIMATION_DURATION,
  DECORATIONS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HIGH_SCORE_KEY,
  INITIAL_LIVES,
  OVEN_HOT_DURATION,
  OVEN_WARMUP_DURATION,
} from "@/lib/game/constants";
import { checkBakerItemCollision } from "@/lib/game/physics";
import {
  getItemPoints,
  getOvens,
  getRandomSpawnInterval,
  itemLosesLife,
  resetItemIdCounter,
  selectRandomOven,
  spawnItem,
} from "@/lib/game/spawner";
import type { Baker, FallingItem, GameSprites, Oven } from "@/lib/game/types";
import { GameHUD } from "./game-hud";

type BakerGameProps = {
  sprites: GameSprites;
  onGameOver: (score: number, highScore: number) => void;
};

export function BakerGame({ sprites, onGameOver }: BakerGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    const bakerRef = useRef<Baker>({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - BAKER_HEIGHT - BAKER_Y_OFFSET,
      width: BAKER_WIDTH,
      height: BAKER_HEIGHT,
      isCatching: false,
      catchTimeout: null,
      animationState: "idle",
      animationTimeout: null,
      lastMoveTime: 0,
      facingDirection: "right",
    });

    const itemsRef = useRef<FallingItem[]>([]);
    const ovensRef = useRef<Oven[]>(getOvens());
    const scoreRef = useRef(0);
    const livesRef = useRef(INITIAL_LIVES);
    const spawnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const ovenTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const highScoreRef = useRef(0);

    useEffect(() => {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        highScoreRef.current = Number.parseInt(stored, 10) || 0;
      }
    }, []);

    // Reset item ID counter on mount (component remounts via key prop for reset)
    useEffect(() => {
      resetItemIdCounter();
    }, []);

    const handlePause = useCallback(() => {
      setIsPaused(true);
    }, []);

    const handleResume = useCallback(() => {
      setIsPaused(false);
    }, []);

    // Keyboard shortcut for pause (Escape or P)
    useEffect(() => {
      if (!isPlaying) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" || e.key === "p" || e.key === "P") {
          e.preventDefault();
          setIsPaused((prev) => !prev);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying]);

    const handleMove = useCallback((updater: (prev: number) => number) => {
      const prevX = bakerRef.current.x;
      const newX = updater(prevX);
      bakerRef.current.x = newX;
      bakerRef.current.lastMoveTime = Date.now();

      // Update facing direction
      if (newX < prevX) {
        bakerRef.current.facingDirection = "left";
      } else if (newX > prevX) {
        bakerRef.current.facingDirection = "right";
      }

      const baker = bakerRef.current;
      if (
        baker.animationState !== "gotBread" &&
        baker.animationState !== "sad"
      ) {
        baker.animationState = "running";
      }
    }, []);

    const isActive = isPlaying && !isPaused;

    const { pressedKeysRef, getClampedX } = useGameControls({
      onMove: handleMove,
      enabled: isActive,
      containerRef,
    });

    const scheduleSpawn = useCallback(() => {
      if (!isPlaying || isPaused) return;

      const interval = getRandomSpawnInterval();
      spawnTimeoutRef.current = setTimeout(() => {
        if (!isPlaying || isPaused) return;

        // Phase 1: Select oven and start warming
        const ovenIndex = selectRandomOven(ovensRef.current);
        const oven = ovensRef.current[ovenIndex];
        oven.heatState = "warming";
        oven.spriteKey = "oven_2";

        // Phase 2: Heat up to hot
        const warmupTimeout = setTimeout(() => {
          if (!isPlaying || isPaused) return;
          oven.heatState = "hot";
          oven.spriteKey = "oven_3";

          // Phase 3: Spawn item and reset oven
          const hotTimeout = setTimeout(() => {
            if (!isPlaying || isPaused) return;
            const newItem = spawnItem(ovensRef.current, scoreRef.current, ovenIndex);
            itemsRef.current.push(newItem);

            // Reset oven to idle
            oven.heatState = "idle";
            oven.spriteKey = "oven_1";

            scheduleSpawn();
          }, OVEN_HOT_DURATION);
          ovenTimeoutsRef.current.push(hotTimeout);
        }, OVEN_WARMUP_DURATION);
        ovenTimeoutsRef.current.push(warmupTimeout);
      }, interval);
    }, [isPlaying, isPaused]);

    useEffect(() => {
      if (isPlaying && !isPaused) {
        scheduleSpawn();
      }

      return () => {
        if (spawnTimeoutRef.current) {
          clearTimeout(spawnTimeoutRef.current);
        }
        for (const t of ovenTimeoutsRef.current) {
          clearTimeout(t);
        }
        ovenTimeoutsRef.current = [];
      };
    }, [isPlaying, isPaused, scheduleSpawn]);

    const triggerCatchAnimation = useCallback(() => {
      const baker = bakerRef.current;
      if (baker.catchTimeout) {
        clearTimeout(baker.catchTimeout);
      }
      if (baker.animationTimeout) {
        clearTimeout(baker.animationTimeout);
      }
      baker.isCatching = true;
      baker.animationState = "gotBread";
      baker.catchTimeout = setTimeout(() => {
        baker.isCatching = false;
        baker.catchTimeout = null;
      }, CATCH_ANIMATION_DURATION);
      baker.animationTimeout = setTimeout(() => {
        baker.animationState = "idle";
        baker.animationTimeout = null;
      }, 400);
    }, []);

    const triggerSadAnimation = useCallback(() => {
      const baker = bakerRef.current;
      if (baker.animationTimeout) {
        clearTimeout(baker.animationTimeout);
      }
      baker.animationState = "sad";
      baker.animationTimeout = setTimeout(() => {
        baker.animationState = "idle";
        baker.animationTimeout = null;
      }, 500);
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
      for (const t of ovenTimeoutsRef.current) {
        clearTimeout(t);
      }
      ovenTimeoutsRef.current = [];

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
          triggerSadAnimation();

          if (livesRef.current <= 0) {
            endGame();
            return true;
          }
        }
        items.splice(index, 1);
        return false;
      },
      [triggerHapticFeedback, triggerSadAnimation, endGame]
    );

    const onUpdate = useCallback(
      (deltaTime: number) => {
        const baker = bakerRef.current;
        const items = itemsRef.current;
        const normalizedDelta = deltaTime / 16.67;
        const keys = pressedKeysRef.current;

        // Apply keyboard movement scaled by delta time
        const isLeft = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
        const isRight = keys.has("ArrowRight") || keys.has("d") || keys.has("D");

        if (isLeft || isRight) {
          const dx = BAKER_SPEED * normalizedDelta * (isLeft ? -1 : 1);
          const newX = getClampedX(baker.x + dx);
          if (newX !== baker.x) {
            baker.facingDirection = isLeft ? "left" : "right";
            baker.x = newX;
            baker.lastMoveTime = Date.now();
            if (baker.animationState !== "gotBread" && baker.animationState !== "sad") {
              baker.animationState = "running";
            }
          }
        }

        // Check if baker should transition from running to idle
        const timeSinceMove = Date.now() - baker.lastMoveTime;
        if (
          baker.animationState === "running" &&
          timeSinceMove > 100
        ) {
          baker.animationState = "idle";
        }

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
      [handleItemCatch, handleItemMiss, pressedKeysRef, getClampedX]
    );

    const getBakerSprite = useCallback(() => {
      const baker = bakerRef.current;
      const isLeft = baker.facingDirection === "left";

      switch (baker.animationState) {
        case "gotBread":
          return isLeft ? sprites.baker_got_bread_left : sprites.baker_got_bread;
        case "sad":
          return isLeft ? sprites.baker_sad_left : sprites.baker_sad;
        case "running":
          return isLeft ? sprites.baker_run_left : sprites.baker_run;
        case "catching":
          return isLeft ? sprites.baker_catch_left : sprites.baker_catch;
        case "idle":
        default:
          return sprites.baker_stay;
      }
    }, [sprites]);

    const drawShadow = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ) => {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      []
    );

    const onRender = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // 1. Background image
      ctx.drawImage(sprites.background, 0, 0, GAME_WIDTH, GAME_HEIGHT);

      // 2. Decorations
      for (const decor of DECORATIONS) {
        const decorSprite = sprites[decor.key];
        ctx.drawImage(decorSprite, decor.x, decor.y, decor.width, decor.height);
      }

      // 3. Ovens
      for (const oven of ovensRef.current) {
        const ovenSprite = sprites[oven.spriteKey];
        ctx.drawImage(ovenSprite, oven.x, oven.y, oven.width, oven.height);
      }

      // 4. Falling items with shadows
      for (const item of itemsRef.current) {
        // Draw small shadow under falling item
        const shadowY = GAME_HEIGHT - BAKER_Y_OFFSET + 5;
        const shadowScale = Math.max(0.3, 1 - (shadowY - item.y) / GAME_HEIGHT);
        drawShadow(
          ctx,
          item.x,
          shadowY,
          item.width * shadowScale * 0.6,
          8 * shadowScale
        );

        const sprite = sprites[item.type];
        ctx.drawImage(
          sprite,
          item.x - item.width / 2,
          item.y - item.height / 2,
          item.width,
          item.height
        );
      }

      // 5. Baker with shadow
      const baker = bakerRef.current;
      // Draw shadow under baker
      drawShadow(
        ctx,
        baker.x,
        baker.y + baker.height - 5,
        baker.width * 0.7,
        15
      );
      const bakerSprite = getBakerSprite();
      ctx.drawImage(
        bakerSprite,
        baker.x - baker.width / 2,
        baker.y,
        baker.width,
        baker.height
      );
    }, [sprites, getBakerSprite, drawShadow]);

    useGameLoop({
      onUpdate,
      onRender,
      enabled: isActive,
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
        <GameHUD lives={lives} onPause={handlePause} score={score} />
        {isPaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
            <h2 className="mb-6 font-bold text-3xl text-white">Pauza</h2>
            <button
              className="rounded-lg bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
              onClick={handleResume}
              type="button"
            >
              Pokračovať
            </button>
            <p className="mt-4 text-gray-300 text-sm">
              Stlač Esc alebo P pre pokračovanie
            </p>
          </div>
        )}
      </div>
    );
}
