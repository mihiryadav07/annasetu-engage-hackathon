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
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import type { Notification } from '../types';

const COLLECTION = 'notifications';

export async function sendNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  link?: string;
}): Promise<Notification> {
  const notifId = 'notif_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  const newNotif: Notification = {
    ...params,
    id: notifId,
    isRead: false,
    createdAt: now,
  };

  try {
    await setDoc(doc(db, COLLECTION, notifId), newNotif);
    return newNotif;
  } catch (err) {
    console.error('Failed to send persistent notification:', err);
    return newNotif;
  }
}

import { DEMO_NOTIFICATIONS } from './seedData';

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId));
    const snap = await getDocs(q);
    const notifs = snap.docs.map(d => d.data() as Notification);
    if (notifs.length > 0) {
      return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return DEMO_NOTIFICATIONS;
  } catch (err) {
    return DEMO_NOTIFICATIONS;
  }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, notifId), {
      isRead: true,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${notifId}`);
  }
}

export async function deleteNotification(notifId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, notifId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTION}/${notifId}`);
  }
}
