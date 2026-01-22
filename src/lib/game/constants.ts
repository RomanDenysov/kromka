import type { ItemConfig } from "./types";

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

export const INITIAL_FALL_SPEED = 2;
export const SPEED_INCREMENT = 0.5;
export const SPEED_INCREMENT_INTERVAL = 50;

export const SPAWN_INTERVAL_MIN = 1000;
export const SPAWN_INTERVAL_MAX = 3000;

export const INITIAL_LIVES = 3;

export const HIGH_SCORE_KEY = "kromka_game_highscore";

export const CATCH_ANIMATION_DURATION = 300;

export const BAKER_WIDTH = 80;
export const BAKER_HEIGHT = 100;
export const BAKER_Y_OFFSET = 50;

export const ITEM_SIZE = 50;

export const OVEN_WIDTH = 100;
export const OVEN_HEIGHT = 80;

export const ITEM_CONFIGS: ItemConfig[] = [
  { type: "bread", points: 1, chance: 0.5, losesLife: true },
  { type: "baguette", points: 2, chance: 0.3, losesLife: true },
  { type: "croissant", points: 10, chance: 0.1, losesLife: true },
  { type: "burnt_bread", points: -5, chance: 0.1, losesLife: false },
];

export const SPRITE_PATHS = {
  matej_run: "/game/sprites/matej_run.png",
  matej_catch: "/game/sprites/matej_catch.png",
  bread: "/game/sprites/bread.png",
  baguette: "/game/sprites/baguette.png",
  croissant: "/game/sprites/croissant.png",
  burnt_bread: "/game/sprites/burnt_bread.png",
  oven: "/game/sprites/oven.png",
} as const;
