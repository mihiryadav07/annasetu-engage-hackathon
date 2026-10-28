/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

// India Geographical Boundaries
export const INDIA_BOUNDS = {
  MIN_LAT: 6.5,
  MAX_LAT: 37.6,
  MIN_LNG: 68.0,
  MAX_LNG: 97.5,
};

export interface AddressValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: {
    city: string;
    state: string;
    pinCode: string;
    country: 'IN';
    lat: number;
    lng: number;
  };
}

/**
 * Validates that an address is strictly within India
 */
export function validateIndianAddress(params: {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
  lat?: number;
  lng?: number;
}): AddressValidationResult {
  const { address, city, state, pinCode, country, lat, lng } = params;

  if (!address || address.trim().length < 5) {
    return { isValid: false, error: 'Street address must be at least 5 characters long.' };
  }

  if (!city || city.trim().length < 2) {
    return { isValid: false, error: 'Valid Indian city or town name is required.' };
  }

  // Country check
  if (country && country.trim().toUpperCase() !== 'IN' && country.trim().toLowerCase() !== 'india') {
    return { isValid: false, error: 'AnnaSetu operations are strictly restricted to India (Country must be IN).' };
  }

  // PIN code check (Indian PIN codes are 6 digits, first digit 1-9)
  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!pinRegex.test(pinCode.trim())) {
    return { isValid: false, error: 'Invalid Indian PIN Code. Must be exactly 6 digits starting with 1-9.' };
  }

  // State check against Indian states & UTs
  const matchedState = INDIAN_STATES_AND_UTS.find(
    s => s.toLowerCase() === state.trim().toLowerCase()
  );
  if (!matchedState) {
    return {
      isValid: false,
      error: `"${state}" is not a recognized Indian State or Union Territory.`,
    };
  }

  // Coordinates check
  if (lat !== undefined && lng !== undefined) {
    if (
      lat < INDIA_BOUNDS.MIN_LAT ||
      lat > INDIA_BOUNDS.MAX_LAT ||
      lng < INDIA_BOUNDS.MIN_LNG ||
      lng > INDIA_BOUNDS.MAX_LNG
    ) {
      return {
        isValid: false,
        error: 'Geographical coordinates fall outside Indian national territorial boundaries.',
      };
    }
  }

  return {
    isValid: true,
    normalized: {
      city: city.trim(),
      state: matchedState,
      pinCode: pinCode.trim(),
      country: 'IN',
      lat: lat ?? 28.6139, // Fallback default to New Delhi if geocode missing
      lng: lng ?? 77.2090,
    },
  };
}

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates
 * (Haversine Formula) - labeled clearly as straight-line distance when road routing is unavailable.
 */
export function calculateStraightLineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
