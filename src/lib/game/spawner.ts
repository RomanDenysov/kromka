import {
  GAME_WIDTH,
  INITIAL_FALL_SPEED,
  ITEM_CONFIGS,
  ITEM_SIZE,
  OVEN_HEIGHT,
  OVEN_WIDTH,
  SPAWN_INTERVAL_MAX,
  SPAWN_INTERVAL_MIN,
  SPEED_INCREMENT,
  SPEED_INCREMENT_INTERVAL,
} from "./constants";
import type { FallingItem, ItemType, Oven } from "./types";

let itemIdCounter = 0;

export function resetItemIdCounter() {
  itemIdCounter = 0;
}

export function getOvens(): Oven[] {
  const ovenY = 10;
  const spacing = GAME_WIDTH / 4;

  return [
    {
      x: spacing - OVEN_WIDTH / 2,
      y: ovenY,
      width: OVEN_WIDTH,
      height: OVEN_HEIGHT,
      spriteKey: "oven_1",
      heatState: "idle",
    },
    {
      x: spacing * 2 - OVEN_WIDTH / 2,
      y: ovenY,
      width: OVEN_WIDTH,
      height: OVEN_HEIGHT,
      spriteKey: "oven_1",
      heatState: "idle",
    },
    {
      x: spacing * 3 - OVEN_WIDTH / 2,
      y: ovenY,
      width: OVEN_WIDTH,
      height: OVEN_HEIGHT,
      spriteKey: "oven_1",
      heatState: "idle",
    },
  ];
}

export function selectRandomOven(ovens: Oven[]): number {
  return Math.floor(Math.random() * ovens.length);
}

export function getRandomItemType(): ItemType {
  const random = Math.random();
  let cumulative = 0;

  for (const config of ITEM_CONFIGS) {
    cumulative += config.chance;
    if (random <= cumulative) {
      return config.type;
    }
  }

  return "bread";
}

export function calculateFallSpeed(score: number): number {
  const increments = Math.floor(score / SPEED_INCREMENT_INTERVAL);
  return INITIAL_FALL_SPEED + increments * SPEED_INCREMENT;
}

export function getRandomSpawnInterval(): number {
  return (
    SPAWN_INTERVAL_MIN +
    Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)
  );
}

export function spawnItem(
  ovens: Oven[],
  score: number,
  ovenIndex?: number
): FallingItem {
  const oven =
    ovenIndex !== undefined
      ? ovens[ovenIndex]
      : ovens[Math.floor(Math.random() * ovens.length)];
  const itemType = getRandomItemType();

  itemIdCounter += 1;

  return {
    id: `item_${itemIdCounter}`,
    type: itemType,
    x: oven.x + oven.width / 2,
    y: oven.y + oven.height,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    speed: calculateFallSpeed(score),
  };
}

export function getItemPoints(itemType: ItemType): number {
  const config = ITEM_CONFIGS.find((c) => c.type === itemType);
  return config?.points ?? 0;
}

export function itemLosesLife(itemType: ItemType): boolean {
  const config = ITEM_CONFIGS.find((c) => c.type === itemType);
  return config?.losesLife ?? true;
}
