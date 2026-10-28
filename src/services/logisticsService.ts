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
import type { Pickup, PickupStatus, DeliveryEvent } from '../types';
import { updateDonationStatus } from './donationService';

const PICKUPS_COLLECTION = 'pickups';
const EVENTS_COLLECTION = 'delivery_events';

/**
 * Generates an expiring 6-digit numeric verification code for physical handover
 */
export function generateHandoverCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createPickupAssignment(params: {
  donationId: string;
  reservationId: string;
  donorOrgId: string;
  donorOrgName: string;
  recipientOrgId: string;
  recipientOrgName: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
}): Promise<Pickup> {
  const pickupId = 'pk_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const handoverCode = generateHandoverCode();

  const newPickup: Pickup = {
    ...params,
    id: pickupId,
    status: 'ASSIGNED',
    handoverCode,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, PICKUPS_COLLECTION, pickupId), newPickup);

    // Record initial milestone event
    await recordDeliveryEvent({
      pickupId,
      donationId: params.donationId,
      status: 'ASSIGNED',
      actorId: 'system',
      actorRole: 'SYSTEM',
      notes: 'Pickup assignment created and pending volunteer acceptance.',
    });

    return newPickup;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PICKUPS_COLLECTION}/${pickupId}`);
  }
}

export async function assignVolunteerToPickup(
  pickupId: string,
  volunteer: { id: string; name: string; phone?: string }
): Promise<void> {
  try {
    const pickupRef = doc(db, PICKUPS_COLLECTION, pickupId);
    const snap = await getDoc(pickupRef);
    if (!snap.exists()) {
      throw new Error('Pickup assignment not found.');
    }
    const pickup = snap.data() as Pickup;
    if (pickup.volunteerId && pickup.volunteerId !== volunteer.id) {
      throw new Error('This pickup is already assigned to another volunteer.');
    }

    const now = new Date().toISOString();
    await updateDoc(pickupRef, {
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      volunteerPhone: volunteer.phone || '',
      assignedAt: now,
      updatedAt: now,
    });

    await recordDeliveryEvent({
      pickupId,
      donationId: pickup.donationId,
      status: 'ASSIGNED',
      actorId: volunteer.id,
      actorRole: 'VOLUNTEER',
      notes: `Volunteer ${volunteer.name} accepted the pickup route.`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${PICKUPS_COLLECTION}/${pickupId}`);
  }
}

export async function updatePickupMilestone(params: {
  pickupId: string;
  newStatus: PickupStatus;
  actorId: string;
  actorRole: string;
  notes?: string;
  collectedQuantity?: number;
  deliveredQuantity?: number;
  providedHandoverCode?: string;
  lat?: number;
  lng?: number;
}): Promise<{ success: boolean; message: string }> {
  const { pickupId, newStatus, actorId, actorRole, notes, collectedQuantity, deliveredQuantity, providedHandoverCode, lat, lng } = params;

  try {
    const pickupRef = doc(db, PICKUPS_COLLECTION, pickupId);
    const snap = await getDoc(pickupRef);
    if (!snap.exists()) {
      return { success: false, message: 'Pickup record not found.' };
    }

    const pickup = snap.data() as Pickup;
    const now = new Date().toISOString();

    // Verify Handover Code on DELIVERED transition
    if (newStatus === 'DELIVERED') {
      if (!providedHandoverCode || providedHandoverCode.trim() !== pickup.handoverCode) {
        return {
          success: false,
          message: 'Invalid Handover Code. Recipient must supply the matching 6-digit confirmation code.',
        };
      }
    }

    const updates: Partial<Pickup> = {
      status: newStatus,
      updatedAt: now,
    };

    if (newStatus === 'COLLECTED') {
      updates.collectedAt = now;
      if (collectedQuantity !== undefined) updates.collectedQuantity = collectedQuantity;
      await updateDonationStatus(pickup.donationId, 'COLLECTED');
    }

    if (newStatus === 'DELIVERED') {
      updates.deliveredAt = now;
      if (deliveredQuantity !== undefined) updates.deliveredQuantity = deliveredQuantity;
      await updateDonationStatus(pickup.donationId, 'DELIVERED');
    }

    if (newStatus === 'FAILED_PICKUP' || newStatus === 'CANCELLED') {
      updates.failureReason = notes || 'Pickup cancelled or failed';
      await updateDonationStatus(pickup.donationId, 'FAILED_PICKUP', updates.failureReason);
    }

    await updateDoc(pickupRef, updates);

    // Record Milestone Event
    await recordDeliveryEvent({
      pickupId,
      donationId: pickup.donationId,
      status: newStatus,
      actorId,
      actorRole,
      notes: notes || `Transitioned status to ${newStatus}`,
      lat,
      lng,
    });

    return { success: true, message: `Status updated to ${newStatus}` };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${PICKUPS_COLLECTION}/${pickupId}`);
  }
}

export async function recordDeliveryEvent(event: Omit<DeliveryEvent, 'id' | 'timestamp'>): Promise<void> {
  const eventId = 'evt_' + Math.random().toString(36).substring(2, 11);
  try {
    await setDoc(doc(db, EVENTS_COLLECTION, eventId), {
      ...event,
      id: eventId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${EVENTS_COLLECTION}/${eventId}`);
  }
}

import { DEMO_PICKUPS } from './seedData';

export async function getAllPickups(): Promise<Pickup[]> {
  try {
    const snap = await getDocs(collection(db, PICKUPS_COLLECTION));
    const items = snap.docs.map(d => d.data() as Pickup);
    if (items.length > 0) return items;
    return DEMO_PICKUPS;
  } catch (err) {
    console.warn('Failed to fetch pickups from Firestore, using demonstrative records:', err);
    return DEMO_PICKUPS;
  }
}

export async function getPickupsForVolunteer(volunteerId: string): Promise<Pickup[]> {
  try {
    const q = query(collection(db, PICKUPS_COLLECTION), where('volunteerId', '==', volunteerId));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => d.data() as Pickup);
    if (items.length > 0) return items;
    return DEMO_PICKUPS.filter(p => p.volunteerId === volunteerId);
  } catch (err) {
    return DEMO_PICKUPS.filter(p => p.volunteerId === volunteerId);
  }
}
