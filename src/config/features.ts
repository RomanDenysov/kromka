/**
 * Landing page feature visibility configuration
 * Toggle features on/off from admin dashboard
 */

export const featureFlags = {
  registrationBanner: false,
  /** Poster-style homepage hero (KROMKA type wall) instead of the photo hero. */
  typographicHero: false,
  eshop: true,
  b2b: true,
  partnership: true,
  stores: true,
  blog: false,
  game: false,
  storesMapOnHomepage: false,
  brandStorySection: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
