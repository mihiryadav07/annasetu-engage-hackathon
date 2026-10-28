/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import type { AuditLog } from '../types';

const COLLECTION = 'audit_logs';

export async function logAuditEvent(params: {
  actorId: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
}): Promise<void> {
  const logId = 'log_' + Math.random().toString(36).substring(2, 11);
  const newLog: AuditLog = {
    id: logId,
    actorId: params.actorId,
    actorEmail: params.actorEmail || 'anonymous',
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    details: params.details,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION, logId), newLog);
  } catch (err) {
    console.error('Failed to write audit log:', err);
    // Silent fail for non-blocking audit write in non-fatal paths
  }
}

import { DEMO_AUDIT_LOGS } from './seedData';

export async function getRecentAuditLogs(max: number = 50): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const logs = snap.docs.map(d => d.data() as AuditLog);
    if (logs.length > 0) {
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, max);
    }
    return DEMO_AUDIT_LOGS.slice(0, max);
  } catch (err) {
    console.warn('Failed to fetch audit logs from Firestore, using demonstrative records:', err);
    return DEMO_AUDIT_LOGS.slice(0, max);
  }
}
