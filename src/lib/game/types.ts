export type GameState = "idle" | "playing" | "gameover";

export type ItemType = "bread" | "baguette" | "croissant" | "burnt_bread";

export type BakerAnimationState =
  | "idle"
  | "running"
  | "catching"
  | "gotBread"
  | "sad";

export type BakerDirection = "left" | "right";

export type OvenSpriteKey = "oven_1" | "oven_2" | "oven_3";

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface FallingItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Baker {
  x: number;
  y: number;
  width: number;
  height: number;
  isCatching: boolean;
  catchTimeout: NodeJS.Timeout | null;
  animationState: BakerAnimationState;
  animationTimeout: NodeJS.Timeout | null;
  lastMoveTime: number;
  facingDirection: BakerDirection;
}

export type OvenHeatState = "idle" | "warming" | "hot";

export interface Oven {
  x: number;
  y: number;
  width: number;
  height: number;
  spriteKey: OvenSpriteKey;
  heatState: OvenHeatState;
}

export interface GameSprites {
  // Baker animations - right facing
  baker_run: HTMLImageElement;
  baker_stay: HTMLImageElement;
  baker_catch: HTMLImageElement;
  baker_got_bread: HTMLImageElement;
  baker_sad: HTMLImageElement;
  // Baker animations - left facing
  baker_run_left: HTMLImageElement;
  baker_catch_left: HTMLImageElement;
  baker_got_bread_left: HTMLImageElement;
  baker_sad_left: HTMLImageElement;
  // Items
  bread: HTMLImageElement;
  baguette: HTMLImageElement;
  croissant: HTMLImageElement;
  burnt_bread: HTMLImageElement;
  // Ovens
  oven_1: HTMLImageElement;
  oven_2: HTMLImageElement;
  oven_3: HTMLImageElement;
  // Decorations
  barrel_decor: HTMLImageElement;
  flour_decor: HTMLImageElement;
  bread_box_decor: HTMLImageElement;
  wheat_decor: HTMLImageElement;
  window_decor: HTMLImageElement;
  // Background
  background: HTMLImageElement;
  // Screens
  game_start: HTMLImageElement;
  game_over: HTMLImageElement;
  // UI
  heart: HTMLImageElement;
}

export interface ItemConfig {
  type: ItemType;
  points: number;
  chance: number;
  losesLife: boolean;
}
