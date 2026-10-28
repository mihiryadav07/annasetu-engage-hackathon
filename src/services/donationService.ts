/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  runTransaction,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import type { Donation, DonationStatus } from '../types';
import { validateIndianAddress } from './addressService';

const COLLECTION = 'donations';

export interface FoodSafetyCheckResult {
  isEligible: boolean;
  state: 'AVAILABLE' | 'PENDING_REVIEW' | 'SAFETY_HOLD';
  warnings: string[];
  reasons: string[];
}

/**
 * Validates food safety eligibility according to standard FSSAI surplus food handling principles
 */
export function evaluateFoodSafetyEligibility(donation: Partial<Donation>): FoodSafetyCheckResult {
  const warnings: string[] = [];
  const reasons: string[] = [];
  let isEligible = true;
  let state: 'AVAILABLE' | 'PENDING_REVIEW' | 'SAFETY_HOLD' = 'AVAILABLE';

  const now = new Date();

  // 1. Mandatory declaration check
  if (!donation.safetyDeclarationAccepted) {
    return {
      isEligible: false,
      state: 'SAFETY_HOLD',
      warnings: [],
      reasons: ['Donor must explicitly accept the Food Safety & Hygiene Declaration.'],
    };
  }

  // 2. Collection deadline check
  if (!donation.latestSafeCollectionDeadline) {
    return {
      isEligible: false,
      state: 'SAFETY_HOLD',
      warnings: [],
      reasons: ['Latest safe collection deadline is mandatory.'],
    };
  }

  const deadline = new Date(donation.latestSafeCollectionDeadline);
  if (deadline.getTime() <= now.getTime()) {
    return {
      isEligible: false,
      state: 'SAFETY_HOLD',
      warnings: [],
      reasons: ['Safe collection deadline has already passed. Food cannot be distributed.'],
    };
  }

  // 3. Cooked meals temperature & time guidelines
  if (donation.category === 'COOKED_MEALS') {
    if (donation.cookedOrPackedAt) {
      const cookedAt = new Date(donation.cookedOrPackedAt);
      const hoursSincePrep = (now.getTime() - cookedAt.getTime()) / (1000 * 60 * 60);

      if (donation.storageType === 'ROOM_TEMP' && hoursSincePrep > 4) {
        isEligible = false;
        state = 'SAFETY_HOLD';
        reasons.push(
          'FSSAI 4-Hour Rule: Cooked food held at ambient room temperature exceeds safe consumption window.'
        );
      } else if (donation.storageType === 'REFRIGERATED') {
        if (donation.temperatureCelsius !== undefined && donation.temperatureCelsius > 8) {
          warnings.push('Chilled food temperature is above recommended 5°C threshold.');
          state = 'PENDING_REVIEW';
        }
      } else if (donation.storageType === 'HOT_INSULATED') {
        if (donation.temperatureCelsius !== undefined && donation.temperatureCelsius < 60) {
          warnings.push('Hot held food temperature recorded below 60°C danger zone limit.');
          state = 'PENDING_REVIEW';
        }
      }
    }
  }

  return {
    isEligible,
    state,
    warnings,
    reasons,
  };
}

export async function createDonation(
  donationData: Omit<
    Donation,
    'id' | 'createdAt' | 'updatedAt' | 'reservedQuantity' | 'collectedQuantity' | 'deliveredQuantity'
  >
): Promise<Donation> {
  // Validate Address in India
  const addressCheck = validateIndianAddress({
    address: donationData.address,
    city: donationData.city,
    state: donationData.state,
    pinCode: donationData.pinCode,
    country: donationData.country,
    lat: donationData.lat,
    lng: donationData.lng,
  });

  if (!addressCheck.isValid) {
    throw new Error(addressCheck.error || 'Pickup address must be within India');
  }

  // Validate Quantity
  if (!donationData.quantity || donationData.quantity <= 0) {
    throw new Error('Donation quantity must be greater than zero.');
  }

  // Evaluate Food Safety
  const safety = evaluateFoodSafetyEligibility(donationData);
  if (!safety.isEligible && donationData.status !== 'DRAFT') {
    throw new Error(safety.reasons.join(' '));
  }

  const donationId = 'don_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  const finalStatus: DonationStatus =
    donationData.status === 'DRAFT'
      ? 'DRAFT'
      : safety.state === 'PENDING_REVIEW'
      ? 'PENDING_REVIEW'
      : 'AVAILABLE';

  const newDonation: Donation = {
    ...donationData,
    id: donationId,
    country: 'IN',
    status: finalStatus,
    reservedQuantity: 0,
    collectedQuantity: 0,
    deliveredQuantity: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, COLLECTION, donationId), newDonation);
    return newDonation;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTION}/${donationId}`);
  }
}

import { DEMO_DONATIONS } from './seedData';

export async function getDonationById(id: string): Promise<Donation | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (snap.exists()) return snap.data() as Donation;
    const found = DEMO_DONATIONS.find(d => d.id === id);
    return found || null;
  } catch (err) {
    const found = DEMO_DONATIONS.find(d => d.id === id);
    return found || null;
  }
}

export async function getDonationsByDonor(donorId: string): Promise<Donation[]> {
  try {
    const q = query(collection(db, COLLECTION), where('donorId', '==', donorId));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => d.data() as Donation);
    if (items.length > 0) return items;
    return DEMO_DONATIONS.filter(d => d.donorId === donorId);
  } catch (err) {
    return DEMO_DONATIONS.filter(d => d.donorId === donorId);
  }
}

export async function getAllDonations(): Promise<Donation[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const items = snap.docs.map(d => d.data() as Donation);
    if (items.length > 0) return items;
    return DEMO_DONATIONS;
  } catch (err) {
    console.warn('Failed to fetch donations from Firestore, using demonstrative records:', err);
    return DEMO_DONATIONS;
  }
}

export async function updateDonationStatus(
  donationId: string,
  newStatus: DonationStatus,
  reason?: string
): Promise<void> {
  try {
    const updates: Partial<Donation> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (reason) {
      updates.safetyHoldReason = reason;
    }
    await updateDoc(doc(db, COLLECTION, donationId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${donationId}`);
  }
}

/**
 * Concurrency-safe quantity reservation using Firestore Transaction
 */
export async function reserveDonationQuantity(
  donationId: string,
  requestedQuantity: number
): Promise<{ success: boolean; error?: string; remainingQuantity?: number }> {
  const donationRef = doc(db, COLLECTION, donationId);

  try {
    return await runTransaction(db, async transaction => {
      const snap = await transaction.get(donationRef);
      if (!snap.exists()) {
        return { success: false, error: 'Donation record does not exist.' };
      }

      const donation = snap.data() as Donation;

      // Status check
      if (donation.status !== 'AVAILABLE' && donation.status !== 'RESERVED') {
        return {
          success: false,
          error: `Donation cannot be reserved because it is currently ${donation.status}.`,
        };
      }

      // Safe deadline check
      if (new Date(donation.latestSafeCollectionDeadline).getTime() <= Date.now()) {
        transaction.update(donationRef, {
          status: 'EXPIRED',
          updatedAt: new Date().toISOString(),
        });
        return {
          success: false,
          error: 'Donation has reached its safe consumption deadline and expired.',
        };
      }

      const availableQuantity = donation.quantity - (donation.reservedQuantity || 0);

      if (requestedQuantity > availableQuantity) {
        return {
          success: false,
          error: `Requested ${requestedQuantity} ${donation.unit}, but only ${availableQuantity} ${donation.unit} available.`,
        };
      }

      const newReserved = (donation.reservedQuantity || 0) + requestedQuantity;
      const isFullyAllocated = newReserved >= donation.quantity;

      transaction.update(donationRef, {
        reservedQuantity: newReserved,
        status: isFullyAllocated ? 'RESERVED' : 'AVAILABLE',
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        remainingQuantity: donation.quantity - newReserved,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${donationId}`);
  }
}
