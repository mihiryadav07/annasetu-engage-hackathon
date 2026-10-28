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
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import type { Organization, VerificationStatus } from '../types';
import { validateIndianAddress } from './addressService';

const COLLECTION = 'organizations';

export async function createOrganization(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'>): Promise<Organization> {
  const addressCheck = validateIndianAddress({
    address: org.address,
    city: org.city,
    state: org.state,
    pinCode: org.pinCode,
    country: org.country,
    lat: org.lat,
    lng: org.lng,
  });

  if (!addressCheck.isValid) {
    throw new Error(addressCheck.error || 'Invalid address in India');
  }

  // FSSAI format check for food donors (FSSAI license numbers in India are 14 digits)
  if (org.type === 'DONOR') {
    if (!org.fssaiNumber || !/^[0-9]{14}$/.test(org.fssaiNumber.trim())) {
      throw new Error('Donors must provide a valid 14-digit FSSAI license or registration number.');
    }
  }

  const orgId = 'org_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  const newOrg: Organization = {
    ...org,
    id: orgId,
    verificationStatus: 'PENDING_VERIFICATION',
    country: 'IN',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, COLLECTION, orgId), newOrg);
    return newOrg;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTION}/${orgId}`);
  }
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (snap.exists()) return snap.data() as Organization;
    const foundDemo = DEMO_ORGANIZATIONS.find(o => o.id === id);
    return foundDemo || null;
  } catch (err) {
    const foundDemo = DEMO_ORGANIZATIONS.find(o => o.id === id);
    return foundDemo || null;
  }
}

import { DEMO_ORGANIZATIONS } from './seedData';

export async function getAllOrganizations(): Promise<Organization[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const items = snap.docs.map(d => d.data() as Organization);
    if (items.length > 0) return items;
    return DEMO_ORGANIZATIONS;
  } catch (err) {
    console.warn('Failed to fetch organizations from Firestore, using demonstrative records:', err);
    return DEMO_ORGANIZATIONS;
  }
}

export async function updateOrganizationVerification(
  orgId: string,
  status: VerificationStatus,
  notes?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, orgId), {
      verificationStatus: status,
      verificationNotes: notes || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${orgId}`);
  }
}

export async function updateOrganizationProfile(
  orgId: string,
  updates: Partial<Organization>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, orgId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${orgId}`);
  }
}
