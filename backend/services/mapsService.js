/**
 * mapsService.js — Upgraded multi-query search with reviews
 * Uses Google Places API (New) v1 Text Search.
 */

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.rating',
  'places.userRatingCount',
  'places.formattedAddress',
  'places.location',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.reviews',
  'places.editorialSummary',
  'places.priceLevel',
  'places.businessStatus',
  'places.regularOpeningHours',
].join(',');

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatPlace(p, lat, lng) {
  const plat = p.location?.latitude ?? lat;
  const plng = p.location?.longitude ?? lng;

  const reviews = (p.reviews || []).slice(0, 4).map((r) => ({
    rating: r.rating,
    text: (r.text?.text || '').slice(0, 250),
    timeAgo: r.relativePublishTimeDescription || '',
    author: r.authorAttribution?.displayName || 'Anonymous',
  }));

  return {
    placeId: p.id,
    name: p.displayName?.text || p.displayName || 'Unknown',
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? 0,
    distanceKm: Number(haversineDistance(lat, lng, plat, plng).toFixed(2)),
    address: p.formattedAddress || '',
    phoneNumber: p.internationalPhoneNumber || p.nationalPhoneNumber || null,
    editorialSummary: p.editorialSummary?.text || null,
    priceLevel: p.priceLevel || null,
    isOpen: p.regularOpeningHours?.openNow ?? null,
    businessStatus: p.businessStatus || 'OPERATIONAL',
    reviews,
  };
}

async function searchByQuery(query, lat, lng, radiusKm, key) {
  const radiusMeters = Math.min(radiusKm * 1000, 50000);
  const url = 'https://places.googleapis.com/v1/places:searchText';

  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
    maxResultCount: 10,
    languageCode: 'en',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Places API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.places || [];
}

/**
 * Run multiple search queries in parallel, deduplicate by placeId,
 * filter by minRating, and sort by composite score.
 */
async function searchMultipleQueries(queries, lat, lng, radiusKm, minRating = 3.0) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY not set in backend/.env');

  console.log(`Maps: searching ${queries.length} queries within ${radiusKm}km, minRating=${minRating}`);

  const results = await Promise.allSettled(
    queries.map((q) => searchByQuery(q, lat, lng, radiusKm, key))
  );

  // Deduplicate by placeId
  const seen = new Set();
  const allPlaces = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const place of result.value) {
        if (place.id && !seen.has(place.id)) {
          seen.add(place.id);
          allPlaces.push(place);
        }
      }
    } else {
      console.warn('Maps query failed:', result.reason?.message);
    }
  }

  console.log(`Maps: found ${allPlaces.length} unique places before rating filter`);

  const filtered = allPlaces
    .filter((p) => p.businessStatus !== 'CLOSED_PERMANENTLY')
    // Allow places with no rating or >= minRating. If minRating is high, allow slightly lower (minRating - 1.5) to give Gemini options to caveat
    .filter((p) => p.rating === null || p.rating === undefined || p.rating >= Math.max(minRating - 1.5, 1.0))
    .map((p) => formatPlace(p, lat, lng))
    .sort((a, b) => {
      // Composite score: rating weighted heavily, slight distance penalty
      const ratingA = a.rating || 2.5; // Treat unrated places as average to not bury them completely
      const ratingB = b.rating || 2.5;
      const scoreA = ratingA * 20 + Math.log1p(a.userRatingCount) - a.distanceKm * 0.5;
      const scoreB = ratingB * 20 + Math.log1p(b.userRatingCount) - b.distanceKm * 0.5;
      return scoreB - scoreA;
    })
    .slice(0, 15); // Give Gemini up to 15 to pick the best 3-5

  return filtered;
}

/**
 * Backward-compatible single-query search.
 */
async function searchNearbyProviders(query, lat, lng, radiusKm, minRating = 3.0) {
  return searchMultipleQueries([query], lat, lng, radiusKm, minRating);
}

/**
 * Reverse geocode lat/lng → { city, country, countryCode }
 * Used to give Gemini accurate location context for any country.
 */
async function reverseGeocode(lat, lng) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { city: null, country: null, countryCode: null };

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality|administrative_area_level_1|country&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return { city: null, country: null, countryCode: null };
    const data = await res.json();

    let city = null, country = null, countryCode = null;
    for (const result of data.results || []) {
      for (const comp of result.address_components || []) {
        if (comp.types.includes('locality') && !city) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1') && !city) city = comp.long_name;
        if (comp.types.includes('country')) {
          country = comp.long_name;
          countryCode = comp.short_name;
        }
      }
      if (city && country) break;
    }
    return { city, country, countryCode };
  } catch {
    return { city: null, country: null, countryCode: null };
  }
}

module.exports = { searchNearbyProviders, searchMultipleQueries, haversineDistance, reverseGeocode };
