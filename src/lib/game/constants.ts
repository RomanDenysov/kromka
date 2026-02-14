import type { ItemConfig } from "./types";

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;

export const INITIAL_FALL_SPEED = 2;
export const SPEED_INCREMENT = 0.5;
export const SPEED_INCREMENT_INTERVAL = 50;

export const SPAWN_INTERVAL_MIN = 1000;
export const SPAWN_INTERVAL_MAX = 3000;

export const INITIAL_LIVES = 3;

export const HIGH_SCORE_KEY = "kromka_game_highscore";

export const CATCH_ANIMATION_DURATION = 300;

export const OVEN_WARMUP_DURATION = 200;
export const OVEN_HOT_DURATION = 200;

export const BAKER_WIDTH = 80;
export const BAKER_HEIGHT = 100;
export const BAKER_Y_OFFSET = 50;
export const BAKER_SPEED = 5;

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
  // Baker animations - right facing
  baker_run: "/game/sprites/baker_run.png",
  baker_stay: "/game/sprites/baker_stay.png",
  baker_catch: "/game/sprites/baker_hands_up.png",
  baker_got_bread: "/game/sprites/baker_got_bread.png",
  baker_sad: "/game/sprites/baker_sad.png",
  // Baker animations - left facing
  baker_run_left: "/game/sprites/baker_run_left.png",
  baker_catch_left: "/game/sprites/baker_hands_up_left.png",
  baker_got_bread_left: "/game/sprites/baker_got_bread_left.png",
  baker_sad_left: "/game/sprites/baker_sad_left.png",
  // Items
  bread: "/game/sprites/good_bread.png",
  baguette: "/game/sprites/bagguette.png",
  croissant: "/game/sprites/croissant 2.png",
  burnt_bread: "/game/sprites/bad_bread.png",
  // Ovens
  oven_1: "/game/sprites/oven_1.png",
  oven_2: "/game/sprites/oven_2.png",
  oven_3: "/game/sprites/oven_3.png",
  // Decorations
  barrel_decor: "/game/sprites/barrel_decor.png",
  flour_decor: "/game/sprites/flour_decor.png",
  bread_box_decor: "/game/sprites/bread_box_decor.png",
  wheat_decor: "/game/sprites/fat_decor.png",
  window_decor: "/game/sprites/widnow_decor.png",
  // Background
  background: "/game/sprites/background.png",
  // Screens
  game_start: "/game/sprites/game_start.png",
  game_over: "/game/sprites/game_over.png",
  // UI
  heart: "/game/sprites/heart.png",
} as const;

export type DecorationKey =
  | "barrel_decor"
  | "flour_decor"
  | "bread_box_decor"
  | "wheat_decor"
  | "window_decor";

export interface Decoration {
  key: DecorationKey;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DECORATIONS: Decoration[] = [
  { key: "window_decor", x: 10, y: 120, width: 80, height: 80 },
  { key: "barrel_decor", x: 20, y: 370, width: 60, height: 80 },
  { key: "flour_decor", x: 720, y: 390, width: 50, height: 60 },
  { key: "bread_box_decor", x: 700, y: 120, width: 80, height: 60 },
  { key: "wheat_decor", x: 100, y: 120, width: 50, height: 80 },
];
