const EARTH_RADIUS_KM = 6371;
const IOS_DEVICE_REGEX = /iphone|ipad|ipod/;
const MAC_DEVICE_REGEX = /macintosh|macintel|macppc|mac68k/;

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance in Slovak locale
 * @param km Distance in kilometers
 * @returns Formatted string like "0,3 km", "1,5 km", "12 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    // Show one decimal for distances under 1km
    return `${km.toLocaleString("sk-SK", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
  }
  if (km < 10) {
    // Show one decimal for distances under 10km
    return `${km.toLocaleString("sk-SK", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
  }
  // Round to whole number for larger distances
  return `${Math.round(km).toLocaleString("sk-SK")} km`;
}

/**
 * Sort stores by distance from user and add distance property
 */
export function sortStoresByDistance<
  T extends { latitude: string | null; longitude: string | null },
>(stores: T[], userLat: number, userLon: number): (T & { distance: number })[] {
  return stores
    .map((store) => {
      const storeLat = store.latitude
        ? Number.parseFloat(store.latitude)
        : null;
      const storeLon = store.longitude
        ? Number.parseFloat(store.longitude)
        : null;

      const distance =
        storeLat !== null && storeLon !== null
          ? calculateDistance(userLat, userLon, storeLat, storeLon)
          : Number.POSITIVE_INFINITY;

      return { ...store, distance };
    })
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Detect if user is on Apple device (iOS/macOS)
 */
function isAppleDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || "").toLowerCase();

  return (
    IOS_DEVICE_REGEX.test(userAgent) ||
    MAC_DEVICE_REGEX.test(platform) ||
    (platform === "macintel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Get appropriate map URL based on device
 * Apple devices -> Apple Maps, others -> Google Maps
 */
export function getMapUrl(
  address: string,
  lat?: string | null,
  lon?: string | null
): string {
  const encodedAddress = encodeURIComponent(address);

  if (isAppleDevice()) {
    // Apple Maps URL
    const baseUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
    if (lat && lon) {
      return `${baseUrl}&ll=${lat},${lon}`;
    }
    return baseUrl;
  }

  // Google Maps URL
  const query = lat && lon ? `${lat},${lon}` : encodedAddress;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Build full address string from address object
 */
export function buildFullAddress(address: {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}): string {
  return [address.street, address.postalCode, address.city, address.country]
    .filter(Boolean)
    .join(", ");
}
