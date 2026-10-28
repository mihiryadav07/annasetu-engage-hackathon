/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import type { Incident, IncidentStatus } from '../types';
import { updateDonationStatus } from './donationService';
import { logAuditEvent } from './auditService';

const COLLECTION = 'incidents';

export async function reportSafetyIncident(params: {
  donationId: string;
  reporterId: string;
  reporterEmail: string;
  reason: string;
  description: string;
}): Promise<Incident> {
  const incidentId = 'inc_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  const newIncident: Incident = {
    ...params,
    id: incidentId,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, COLLECTION, incidentId), newIncident);

    // Automatically trigger EMERGENCY SAFETY HOLD on the affected food donation
    await updateDonationStatus(params.donationId, 'SAFETY_HOLD', params.reason);

    // Record audit event
    await logAuditEvent({
      actorId: params.reporterId,
      actorEmail: params.reporterEmail,
      action: 'SAFETY_INCIDENT_REPORTED',
      resourceType: 'DONATION',
      resourceId: params.donationId,
      details: `Reported safety concern: ${params.reason}. Donation suspended to SAFETY_HOLD.`,
    });

    return newIncident;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTION}/${incidentId}`);
  }
}

export async function resolveSafetyIncident(params: {
  incidentId: string;
  adminId: string;
  adminEmail: string;
  newStatus: IncidentStatus;
  resolutionNotes: string;
  donationId: string;
  reinstateDonation?: boolean;
}): Promise<void> {
  const { incidentId, adminId, adminEmail, newStatus, resolutionNotes, donationId, reinstateDonation } = params;
  const now = new Date().toISOString();

  try {
    await updateDoc(doc(db, COLLECTION, incidentId), {
      status: newStatus,
      resolutionNotes,
      updatedAt: now,
    });

    if (reinstateDonation) {
      await updateDonationStatus(donationId, 'AVAILABLE', 'Reinstated after safety review');
    }

    await logAuditEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'SAFETY_INCIDENT_RESOLVED',
      resourceType: 'INCIDENT',
      resourceId: incidentId,
      details: `Incident marked as ${newStatus}. Notes: ${resolutionNotes}. Reinstated: ${Boolean(reinstateDonation)}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${incidentId}`);
  }
}

import { DEMO_INCIDENTS } from './seedData';

export async function getAllIncidents(): Promise<Incident[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const items = snap.docs.map(d => d.data() as Incident);
    if (items.length > 0) return items;
    return DEMO_INCIDENTS;
  } catch (err) {
    console.warn('Failed to fetch incidents from Firestore, using demonstrative records:', err);
    return DEMO_INCIDENTS;
  }
}
