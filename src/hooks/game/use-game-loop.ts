"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseGameLoopOptions {
  onUpdate: (deltaTime: number) => void;
  onRender: () => void;
  enabled: boolean;
}

export function useGameLoop({
  onUpdate,
  onRender,
  enabled,
}: UseGameLoopOptions) {
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      onUpdate(deltaTime);
      onRender();

      frameRef.current = requestAnimationFrame(gameLoop);
    },
    [onUpdate, onRender]
  );

  useEffect(() => {
    if (!enabled) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        lastTimeRef.current = 0;
      }
      return;
    }

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled, gameLoop]);
}
