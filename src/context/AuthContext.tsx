/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, testConnection } from '../firebase/config';
import { signInWithGoogle, signOutUser, syncUserProfile } from '../services/authService';
import { getOrganizationById } from '../services/organizationService';
import type { UserProfile, Organization, UserRole } from '../types';

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  organization: Organization | null;
  loading: boolean;
  isFirebaseConnected: boolean;
  isDemoMode: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  reloadOrganization: (orgId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Demo seed personas to facilitate complete instant testing across all roles
export const DEMO_PERSONAS: Record<UserRole, { profile: UserProfile; org?: Organization }> = {
  DONOR: {
    profile: {
      uid: 'demo_donor_01',
      email: 'taj.banquets@mumbai-hospitality.in',
      displayName: 'Vikram Mehta (Taj Banquet)',
      role: 'DONOR',
      organizationId: 'demo_org_donor_01',
      phone: '+91 98200 12345',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    org: {
      id: 'demo_org_donor_01',
      name: 'Grand Pavilion Caterers & Banquets',
      type: 'DONOR',
      category: 'Banquet & Luxury Caterer',
      fssaiNumber: '11521018000342',
      contactName: 'Vikram Mehta',
      contactPhone: '+91 98200 12345',
      contactEmail: 'taj.banquets@mumbai-hospitality.in',
      address: 'Plot 44, Worli Sea Face, Worli',
      city: 'Mumbai',
      district: 'Mumbai City',
      state: 'Maharashtra',
      pinCode: '400018',
      country: 'IN',
      lat: 19.0178,
      lng: 72.8173,
      verificationStatus: 'VERIFIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  RECIPIENT: {
    profile: {
      uid: 'demo_recipient_01',
      email: 'coordinator@roti-bank-mumbai.org',
      displayName: 'Sunita Sharma (Roti Bank NGO)',
      role: 'RECIPIENT',
      organizationId: 'demo_org_recip_01',
      phone: '+91 98201 67890',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    org: {
      id: 'demo_org_recip_01',
      name: 'Mumbai Food Relief & Community Kitchen',
      type: 'RECIPIENT',
      category: 'Community Kitchen & Shelter',
      registrationNumber: 'NGO-DARPAN-MH/2019/024819',
      contactName: 'Sunita Sharma',
      contactPhone: '+91 98201 67890',
      contactEmail: 'coordinator@roti-bank-mumbai.org',
      address: 'Building 12, Parel East',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      pinCode: '400012',
      country: 'IN',
      lat: 19.0028,
      lng: 72.8423,
      verificationStatus: 'VERIFIED',
      servingCapacity: 450,
      dietaryRequirements: 'Vegetarian and Halal friendly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  VOLUNTEER: {
    profile: {
      uid: 'demo_volunteer_01',
      email: 'arjun.deshmukh@gmail.com',
      displayName: 'Arjun Deshmukh (Volunteer)',
      role: 'VOLUNTEER',
      phone: '+91 97690 54321',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  ADMIN: {
    profile: {
      uid: 'demo_admin_01',
      email: 'mihiryadav1100@gmail.com',
      displayName: 'Mihir Yadav (Platform Admin)',
      role: 'ADMIN',
      phone: '+91 98100 99999',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEMO_PERSONAS.DONOR.profile);
  const [organization, setOrganization] = useState<Organization | null>(DEMO_PERSONAS.DONOR.org || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  useEffect(() => {
    // Test connection
    testConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        setUser(fbUser);
        setIsDemoMode(false);
        try {
          const userProf = await syncUserProfile(fbUser);
          setProfile(userProf);
          if (userProf.organizationId) {
            const org = await getOrganizationById(userProf.organizationId);
            setOrganization(org);
          } else {
            setOrganization(null);
          }
        } catch (e) {
          console.error('Error loading user profile:', e);
        }
      } else {
        // Fall back to default demo persona (DONOR) so the application is immediately testable
        setUser(null);
        setIsDemoMode(true);
        setProfile(DEMO_PERSONAS.DONOR.profile);
        setOrganization(DEMO_PERSONAS.DONOR.org || null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setIsDemoMode(true);
    setProfile(DEMO_PERSONAS.DONOR.profile);
    setOrganization(DEMO_PERSONAS.DONOR.org || null);
  };

  const switchDemoRole = async (role: UserRole) => {
    setIsDemoMode(true);
    const persona = DEMO_PERSONAS[role];
    setProfile(persona.profile);
    setOrganization(persona.org || null);
  };

  const reloadOrganization = async (orgId: string) => {
    try {
      const org = await getOrganizationById(orgId);
      setOrganization(org);
    } catch (err) {
      console.error('Failed to reload organization:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        organization,
        loading,
        isFirebaseConnected,
        isDemoMode,
        signIn,
        signOut,
        switchDemoRole,
        reloadOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
