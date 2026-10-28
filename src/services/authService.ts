/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import type { UserProfile, UserRole } from '../types';

const ADMIN_EMAIL = 'mihiryadav1100@gmail.com';
const COLLECTION = 'users';

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  await syncUserProfile(cred.user);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function syncUserProfile(
  user: FirebaseUser,
  requestedRole?: UserRole,
  organizationId?: string
): Promise<UserProfile> {
  const userRef = doc(db, COLLECTION, user.uid);

  try {
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      // Auto-assign ADMIN if email matches platform admin
      if (user.email === ADMIN_EMAIL && existing.role !== 'ADMIN') {
        await updateDoc(userRef, { role: 'ADMIN', updatedAt: now });
        return { ...existing, role: 'ADMIN' };
      }
      return existing;
    }

    // New profile creation
    // CRITICAL: Public registration must NEVER grant administrator privileges
    let initialRole: UserRole = requestedRole || 'DONOR';
    if (user.email === ADMIN_EMAIL) {
      initialRole = 'ADMIN';
    } else if (initialRole === 'ADMIN') {
      initialRole = 'DONOR'; // Guard against self-assigned admin
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      role: initialRole,
      organizationId: organizationId || '',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLLECTION}/${user.uid}`);
  }
}

export async function updateUserRole(uid: string, role: UserRole, organizationId?: string): Promise<void> {
  if (role === 'ADMIN') {
    throw new Error('Public self-assignment to ADMIN is strictly forbidden.');
  }
  const userRef = doc(db, COLLECTION, uid);
  try {
    const updates: Partial<UserProfile> = {
      role,
      updatedAt: new Date().toISOString(),
    };
    if (organizationId) {
      updates.organizationId = organizationId;
    }
    await updateDoc(userRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION}/${uid}`);
  }
}
