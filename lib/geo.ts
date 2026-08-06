export interface CityConfig {
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
}

export const CITIES: Record<string, CityConfig> = {
  // France
  Paris: { name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.8566, lng: 2.3522 },
  Lyon: { name: 'Lyon', country: 'France', flag: '🇫🇷', lat: 45.7640, lng: 4.8357 },
  Marseille: { name: 'Marseille', country: 'France', flag: '🇫🇷', lat: 43.2965, lng: 5.3698 },
  Bordeaux: { name: 'Bordeaux', country: 'France', flag: '🇫🇷', lat: 44.8378, lng: -0.5792 },
  Lille: { name: 'Lille', country: 'France', flag: '🇫🇷', lat: 50.6292, lng: 3.0573 },
  Toulouse: { name: 'Toulouse', country: 'France', flag: '🇫🇷', lat: 43.6047, lng: 1.4442 },
  Nice: { name: 'Nice', country: 'France', flag: '🇫🇷', lat: 43.7102, lng: 7.2620 },
  Nantes: { name: 'Nantes', country: 'France', flag: '🇫🇷', lat: 47.2181, lng: -1.5536 },
  Strasbourg: { name: 'Strasbourg', country: 'France', flag: '🇫🇷', lat: 48.5734, lng: 7.7521 },
  Montpellier: { name: 'Montpellier', country: 'France', flag: '🇫🇷', lat: 43.6108, lng: 3.8767 },
  Cannes: { name: 'Cannes', country: 'France', flag: '🇫🇷', lat: 43.5528, lng: 7.0174 },

  // Belgique
  Bruxelles: { name: 'Bruxelles', country: 'Belgique', flag: '🇧🇪', lat: 50.8503, lng: 4.3517 },
  Liège: { name: 'Liège', country: 'Belgique', flag: '🇧🇪', lat: 50.6326, lng: 5.5797 },
  Charleroi: { name: 'Charleroi', country: 'Belgique', flag: '🇧🇪', lat: 50.4108, lng: 4.4446 },
  Namur: { name: 'Namur', country: 'Belgique', flag: '🇧🇪', lat: 50.4674, lng: 4.8719 },
  Anvers: { name: 'Anvers', country: 'Belgique', flag: '🇧🇪', lat: 51.2194, lng: 4.4025 },

  // Luxembourg
  Luxembourg: { name: 'Luxembourg', country: 'Luxembourg', flag: '🇱🇺', lat: 49.6116, lng: 6.1319 },
  'Esch-sur-Alzette': { name: 'Esch-sur-Alzette', country: 'Luxembourg', flag: '🇱🇺', lat: 49.4958, lng: 5.9806 },

  // Suisse
  Genève: { name: 'Genève', country: 'Suisse', flag: '🇨🇭', lat: 46.2044, lng: 6.1432 },
  Lausanne: { name: 'Lausanne', country: 'Suisse', flag: '🇨🇭', lat: 46.5197, lng: 6.6323 },
  Neuchâtel: { name: 'Neuchâtel', country: 'Suisse', flag: '🇨🇭', lat: 46.9899, lng: 6.9293 },
  Zurich: { name: 'Zurich', country: 'Suisse', flag: '🇨🇭', lat: 47.3769, lng: 8.5417 },

  // Monaco
  Monaco: { name: 'Monaco', country: 'Monaco', flag: '🇲🇨', lat: 43.7384, lng: 7.4246 },
};

export const COUNTRIES = [
  { code: 'ALL', name: 'Tous les pays', flag: '🇪🇺' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
];

// Backwards compatibility dictionary of city lat/lngs
export const FRENCH_CITIES: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  Object.entries(CITIES).map(([key, val]) => [key, { lat: val.lat, lng: val.lng }])
);

/**
 * Calculate distance in kilometers between two GPS coordinates using the Haversine formula.
 */
export function getDistance(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (
    lat1 === undefined ||
    lat1 === null ||
    lon1 === undefined ||
    lon1 === null ||
    lat2 === undefined ||
    lat2 === null ||
    lon2 === undefined ||
    lon2 === null
  ) {
    return Infinity;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Helper to resolve city coordinates if lat/lng are missing
 */
export function resolveLocationCoords(city: string, userLat?: number, userLng?: number): { lat: number; lng: number } {
  if (userLat && userLng) {
    return { lat: userLat, lng: userLng };
  }
  const matched = Object.keys(FRENCH_CITIES).find(
    (c) => c.toLowerCase() === city.trim().toLowerCase()
  );
  if (matched && FRENCH_CITIES[matched]) {
    return FRENCH_CITIES[matched];
  }
  return FRENCH_CITIES['Paris'];
}
