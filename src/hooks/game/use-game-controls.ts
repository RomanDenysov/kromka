"use client";

import { useCallback, useEffect, useRef } from "react";
import { BAKER_WIDTH, GAME_WIDTH } from "@/lib/game/constants";

interface UseGameControlsOptions {
  onMove: (updater: (prev: number) => number) => void;
  enabled: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
}

export function useGameControls({
  onMove,
  enabled,
  containerRef,
}: UseGameControlsOptions) {
  const isDraggingRef = useRef(false);
  const pressedKeysRef = useRef(new Set<string>());

  const getClampedX = useCallback((x: number): number => {
    const halfWidth = BAKER_WIDTH / 2;
    return Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, x));
  }, []);

  const getRelativeX = useCallback(
    (clientX: number): number => {
      const container = containerRef.current;
      if (!container) return GAME_WIDTH / 2;

      const rect = container.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const scaleX = GAME_WIDTH / rect.width;
      return relativeX * scaleX;
    },
    [containerRef]
  );

  // Keyboard: track pressed keys (movement applied in game loop)
  useEffect(() => {
    if (!enabled) {
      pressedKeysRef.current.clear();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "A" ||
        e.key === "ArrowRight" ||
        e.key === "d" ||
        e.key === "D"
      ) {
        pressedKeysRef.current.add(e.key);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.key);
    };

    const handleBlur = () => {
      pressedKeysRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled]);

  // Mouse and touch: position-based (unchanged)
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      const x = getRelativeX(e.clientX);
      onMove(() => getClampedX(x));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const x = getRelativeX(e.clientX);
      onMove(() => getClampedX(x));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      const touch = e.touches[0];
      if (touch) {
        const x = getRelativeX(touch.clientX);
        onMove(() => getClampedX(x));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.touches[0];
      if (touch) {
        const x = getRelativeX(touch.clientX);
        onMove(() => getClampedX(x));
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, containerRef, onMove, getRelativeX, getClampedX]);

  return { pressedKeysRef, getClampedX };
}
