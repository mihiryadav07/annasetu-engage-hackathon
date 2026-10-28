/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Donation, Organization, Pickup, Incident } from '../types';

export interface SystemAnalytics {
  totals: {
    totalDonations: number;
    activeDonations: number;
    completedDeliveries: number;
    safetyHolds: number;
  };
  quantitiesByUnit: {
    KG: { offered: number; delivered: number };
    LITRES: { offered: number; delivered: number };
    MEAL_TRAYS: { offered: number; delivered: number };
    PORTIONS: { offered: number; delivered: number };
  };
  estimatedMealsRescued: number;
  organizations: {
    verifiedDonors: number;
    verifiedRecipients: number;
    pendingVerification: number;
  };
  volunteersCount: number;
  successRatePercent: number;
  geographicDistribution: { [state: string]: number };
}

export function computeAnalytics(
  donations: Donation[],
  organizations: Organization[],
  pickups: Pickup[],
  incidents: Incident[]
): SystemAnalytics {
  const quantities = {
    KG: { offered: 0, delivered: 0 },
    LITRES: { offered: 0, delivered: 0 },
    MEAL_TRAYS: { offered: 0, delivered: 0 },
    PORTIONS: { offered: 0, delivered: 0 },
  };

  let totalMeals = 0;
  let activeDonations = 0;
  let safetyHolds = 0;
  const geographicDistribution: { [state: string]: number } = {};

  for (const d of donations) {
    if (d.status === 'AVAILABLE' || d.status === 'RESERVED' || d.status === 'PICKUP_ASSIGNED') {
      activeDonations++;
    }
    if (d.status === 'SAFETY_HOLD') {
      safetyHolds++;
    }

    const unit = d.unit || 'KG';
    if (quantities[unit]) {
      quantities[unit].offered += d.quantity || 0;
      quantities[unit].delivered += d.deliveredQuantity || 0;
    }

    if (d.status === 'DELIVERED') {
      totalMeals += d.estimatedServings || 0;
    }

    if (d.state) {
      geographicDistribution[d.state] = (geographicDistribution[d.state] || 0) + 1;
    }
  }

  const completedPickups = pickups.filter(p => p.status === 'DELIVERED').length;
  const attemptedPickups = pickups.filter(p => p.status === 'DELIVERED' || p.status === 'FAILED_PICKUP').length;
  const successRate = attemptedPickups > 0 ? Math.round((completedPickups / attemptedPickups) * 100) : 100;

  const verifiedDonors = organizations.filter(o => o.type === 'DONOR' && o.verificationStatus === 'VERIFIED').length;
  const verifiedRecipients = organizations.filter(o => o.type === 'RECIPIENT' && o.verificationStatus === 'VERIFIED').length;
  const pendingVerification = organizations.filter(o => o.verificationStatus === 'PENDING_VERIFICATION').length;

  const uniqueVolunteers = new Set(pickups.map(p => p.volunteerId).filter(Boolean)).size;

  return {
    totals: {
      totalDonations: donations.length,
      activeDonations,
      completedDeliveries: completedPickups,
      safetyHolds,
    },
    quantitiesByUnit: quantities,
    estimatedMealsRescued: totalMeals,
    organizations: {
      verifiedDonors,
      verifiedRecipients,
      pendingVerification,
    },
    volunteersCount: uniqueVolunteers,
    successRatePercent: successRate,
    geographicDistribution,
  };
}
