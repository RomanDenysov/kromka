import type { Baker, FallingItem } from "./types";

interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkCollision(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function checkBakerItemCollision(
  baker: Baker,
  item: FallingItem
): boolean {
  const bakerHitbox: AABB = {
    x: baker.x - baker.width / 2,
    y: baker.y,
    width: baker.width,
    height: baker.height * 0.3,
  };

  const itemHitbox: AABB = {
    x: item.x - item.width / 2,
    y: item.y - item.height / 2,
    width: item.width,
    height: item.height,
  };

  return checkCollision(bakerHitbox, itemHitbox);
}
