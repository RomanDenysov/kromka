/**
 * Landing page feature visibility configuration
 * Toggle features on/off from admin dashboard
 */

export const featureFlags = {
  eshop: true,
  b2b: false,
  partnership: true,
  stores: true,
  blog: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
