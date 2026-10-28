/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Donation, Organization, MatchScoreResult } from '../types';
import { calculateStraightLineDistanceKm } from './addressService';

export interface MatchingWeights {
  distanceWeight: number; // e.g. 0.35
  urgencyWeight: number;  // e.g. 0.30
  capacityWeight: number; // e.g. 0.20
  compatibilityWeight: number; // e.g. 0.15
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  distanceWeight: 0.35,
  urgencyWeight: 0.30,
  capacityWeight: 0.20,
  compatibilityWeight: 0.15,
};

/**
 * Deterministic Matching Engine for AnnaSetu
 * Ranks donations for a recipient with full explainability and hard constraint enforcement.
 */
export function rankDonationsForRecipient(
  recipientOrg: Organization,
  donations: Donation[],
  weights: MatchingWeights = DEFAULT_WEIGHTS
): MatchScoreResult[] {
  const results: MatchScoreResult[] = [];
  const now = new Date().getTime();

  for (const donation of donations) {
    const reasons: string[] = [];
    let isEligible = true;

    // Hard Constraint 1: Safe Lifecycle Status
    if (donation.status !== 'AVAILABLE') {
      isEligible = false;
      reasons.push(`Ineligible status: ${donation.status}`);
    }

    // Hard Constraint 2: Expiration & Safe Deadline
    const deadlineTime = new Date(donation.latestSafeCollectionDeadline).getTime();
    const hoursRemaining = (deadlineTime - now) / (1000 * 60 * 60);
    if (hoursRemaining <= 0) {
      isEligible = false;
      reasons.push('Safety deadline has passed (Expired).');
    }

    // Hard Constraint 3: Dietary compatibility
    // If recipient explicitly specifies vegetarian only, reject non-veg food
    if (
      recipientOrg.dietaryRequirements &&
      recipientOrg.dietaryRequirements.toLowerCase().includes('veg') &&
      donation.dietaryType === 'NON_VEG'
    ) {
      isEligible = false;
      reasons.push('Dietary Conflict: Non-vegetarian food incompatible with recipient dietary policy.');
    }

    // Hard Constraint 4: Remaining Quantity Available
    const remainingQty = donation.quantity - (donation.reservedQuantity || 0);
    if (remainingQty <= 0) {
      isEligible = false;
      reasons.push('All quantities are currently reserved or fulfilled.');
    }

    // Calculate Straight-line Distance (labeled as straight-line)
    const distanceKm = calculateStraightLineDistanceKm(
      recipientOrg.lat || 28.6139,
      recipientOrg.lng || 77.2090,
      donation.lat || 28.6139,
      donation.lng || 77.2090
    );

    // Hard Constraint 5: Feasibility radius (> 40km typically infeasible for fresh hot meals in urban India)
    if (donation.category === 'COOKED_MEALS' && distanceKm > 40) {
      isEligible = false;
      reasons.push(`Distance (${distanceKm} km straight-line) exceeds cooked food travel threshold.`);
    }

    // Score Calculations (0 to 100)
    // 1. Distance Score: 100 at 0km, decays over 30km
    const distanceScore = Math.max(0, Math.min(100, Math.round((1 - distanceKm / 30) * 100)));

    // 2. Urgency Score: More urgent (closer to deadline) gets higher priority, capped at 6h window
    let urgencyScore = 50;
    if (hoursRemaining > 0 && hoursRemaining < 6) {
      urgencyScore = Math.round(100 - (hoursRemaining / 6) * 50);
    } else if (hoursRemaining >= 6) {
      urgencyScore = 40;
    }

    // 3. Capacity Score: Checks if recipient's daily serving capacity matches donation servings
    let capacityScore = 70;
    const recipientCapacity = recipientOrg.servingCapacity || 100;
    if (donation.estimatedServings <= recipientCapacity) {
      // Optimal match
      capacityScore = 100;
    } else {
      // Partial match: donation is larger than recipient capacity
      capacityScore = Math.max(20, Math.round((recipientCapacity / donation.estimatedServings) * 100));
      reasons.push(`Partial capacity match (${donation.estimatedServings} servings vs ${recipientCapacity} capacity).`);
    }

    // 4. Compatibility Score
    let compatibilityScore = 90;
    if (donation.dietaryType === 'VEG') {
      compatibilityScore = 100; // Veg food has universal acceptance across Indian communities
    }

    // Overall Weighted Score
    const totalScore = Math.round(
      distanceScore * weights.distanceWeight +
      urgencyScore * weights.urgencyWeight +
      capacityScore * weights.capacityWeight +
      compatibilityScore * weights.compatibilityWeight
    );

    if (isEligible) {
      reasons.push(
        `${distanceKm} km (straight-line distance)`,
        `${Math.round(hoursRemaining * 10) / 10}h until safe collection deadline`,
        `Dietary: ${donation.dietaryType}`
      );
    }

    results.push({
      donation,
      score: isEligible ? totalScore : 0,
      distanceKm,
      isEligible,
      factors: {
        distanceScore,
        urgencyScore,
        capacityScore,
        compatibilityScore,
      },
      reasons,
    });
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}
