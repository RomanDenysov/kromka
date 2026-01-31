"use client";

import { useEffect, useState } from "react";
import { SPRITE_PATHS } from "@/lib/game/constants";
import type { GameSprites } from "@/lib/game/types";

type SpriteKey = keyof typeof SPRITE_PATHS;

export function useGameSprites() {
  const [sprites, setSprites] = useState<GameSprites | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const spriteKeys = Object.keys(SPRITE_PATHS) as SpriteKey[];
    const loadedSprites: Partial<GameSprites> = {};
    let loadedCount = 0;

    const handleLoad = (key: SpriteKey, img: HTMLImageElement) => {
      loadedSprites[key] = img;
      loadedCount += 1;

      if (loadedCount === spriteKeys.length) {
        setSprites(loadedSprites as GameSprites);
        setLoading(false);
      }
    };

    const handleError = (key: SpriteKey) => {
      setError(new Error(`Failed to load sprite: ${key}`));
      setLoading(false);
    };

    for (const key of spriteKeys) {
      const img = new Image();
      img.src = SPRITE_PATHS[key];
      img.onload = () => handleLoad(key, img);
      img.onerror = () => handleError(key);
    }
  }, []);

  return { sprites, loading, error };
}
