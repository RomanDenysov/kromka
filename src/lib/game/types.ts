export type GameState = "idle" | "playing" | "gameover";

export type ItemType = "bread" | "baguette" | "croissant" | "burnt_bread";

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
}

export interface Oven {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameSprites {
  matej_run: HTMLImageElement;
  matej_catch: HTMLImageElement;
  bread: HTMLImageElement;
  baguette: HTMLImageElement;
  croissant: HTMLImageElement;
  burnt_bread: HTMLImageElement;
  oven: HTMLImageElement;
}

export interface ItemConfig {
  type: ItemType;
  points: number;
  chance: number;
  losesLife: boolean;
}
