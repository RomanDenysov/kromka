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
  height: number;
  width: number;
}

export interface FallingItem {
  height: number;
  id: string;
  speed: number;
  type: ItemType;
  width: number;
  x: number;
  y: number;
}

export interface Baker {
  animationState: BakerAnimationState;
  animationTimeout: NodeJS.Timeout | null;
  catchTimeout: NodeJS.Timeout | null;
  facingDirection: BakerDirection;
  height: number;
  isCatching: boolean;
  lastMoveTime: number;
  width: number;
  x: number;
  y: number;
}

export type OvenHeatState = "idle" | "warming" | "hot";

export interface Oven {
  heatState: OvenHeatState;
  height: number;
  spriteKey: OvenSpriteKey;
  width: number;
  x: number;
  y: number;
}

export interface GameSprites {
  // Background
  background: HTMLImageElement;
  baguette: HTMLImageElement;
  baker_catch: HTMLImageElement;
  baker_catch_left: HTMLImageElement;
  baker_got_bread: HTMLImageElement;
  baker_got_bread_left: HTMLImageElement;
  // Baker animations - right facing
  baker_run: HTMLImageElement;
  // Baker animations - left facing
  baker_run_left: HTMLImageElement;
  baker_sad: HTMLImageElement;
  baker_sad_left: HTMLImageElement;
  baker_stay: HTMLImageElement;
  // Decorations
  barrel_decor: HTMLImageElement;
  // Items
  bread: HTMLImageElement;
  bread_box_decor: HTMLImageElement;
  burnt_bread: HTMLImageElement;
  croissant: HTMLImageElement;
  flour_decor: HTMLImageElement;
  game_over: HTMLImageElement;
  // Screens
  game_start: HTMLImageElement;
  // UI
  heart: HTMLImageElement;
  // Ovens
  oven_1: HTMLImageElement;
  oven_2: HTMLImageElement;
  oven_3: HTMLImageElement;
  wheat_decor: HTMLImageElement;
  window_decor: HTMLImageElement;
}

export interface ItemConfig {
  chance: number;
  losesLife: boolean;
  points: number;
  type: ItemType;
}
