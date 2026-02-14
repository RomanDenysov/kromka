/**
 * Landing page feature visibility configuration
 * Toggle features on/off from admin dashboard
 */

export const featureFlags = {
  eshop: true,
  b2b: true,
  partnership: true,
  stores: true,
  blog: false,
  game: false,
} as const

export type FeatureFlag = keyof typeof featureFlags
