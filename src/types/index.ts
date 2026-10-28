/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'DONOR' | 'RECIPIENT' | 'VOLUNTEER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export type OrgType = 'DONOR' | 'RECIPIENT';

export type VerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type FoodCategory =
  | 'COOKED_MEALS'
  | 'RAW_GROCERY'
  | 'PACKAGED_FOOD'
  | 'BAKERY'
  | 'FRUITS_VEGETABLES';

export type QuantityUnit = 'KG' | 'LITRES' | 'MEAL_TRAYS' | 'PORTIONS';

export type DietaryType = 'VEG' | 'NON_VEG' | 'VEGAN';

export type StorageType = 'ROOM_TEMP' | 'REFRIGERATED' | 'HOT_INSULATED' | 'FROZEN';

export type DonationStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'ACCEPTED'
  | 'PICKUP_ASSIGNED'
  | 'COLLECTED'
  | 'DELIVERED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'SAFETY_HOLD'
  | 'FAILED_PICKUP';

export type ReservationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED' | 'FULFILLED';

export type PickupStatus =
  | 'ASSIGNED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'COLLECTED'
  | 'EN_ROUTE_TO_RECIPIENT'
  | 'ARRIVED_AT_RECIPIENT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED_PICKUP';

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface IndianAddress {
  street: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: 'IN';
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  category: string; // e.g. "Restaurant", "Hotel", "Banquet Hall", "NGO Shelter", "Community Kitchen"
  fssaiNumber?: string;
  registrationNumber?: string; // 12A/80G or Darpan ID for NGOs
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: 'IN';
  lat: number;
  lng: number;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  servingCapacity?: number; // Daily meal distribution capacity
  dietaryRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorOrgId: string;
  donorOrgName: string;
  foodName: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  estimatedServings: number;
  dietaryType: DietaryType;
  allergens: string;
  cookedOrPackedAt: string;
  storageType: StorageType;
  temperatureCelsius?: number;
  packagingDetails: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: 'IN';
  lat: number;
  lng: number;
  earliestCollectionTime: string;
  latestSafeCollectionDeadline: string;
  status: DonationStatus;
  reservedQuantity: number;
  collectedQuantity: number;
  deliveredQuantity: number;
  safetyDeclarationAccepted: boolean;
  safetyHoldReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  donationId: string;
  recipientId: string;
  recipientOrgId: string;
  recipientOrgName: string;
  quantity: number;
  estimatedServings: number;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pickup {
  id: string;
  donationId: string;
  reservationId: string;
  donorOrgId: string;
  donorOrgName: string;
  recipientOrgId: string;
  recipientOrgName: string;
  volunteerId?: string;
  volunteerName?: string;
  volunteerPhone?: string;
  status: PickupStatus;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  collectedQuantity?: number;
  deliveredQuantity?: number;
  handoverCode?: string; // Expiring single-use verification code
  assignedAt?: string;
  collectedAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryEvent {
  id: string;
  pickupId: string;
  donationId: string;
  status: PickupStatus;
  actorId: string;
  actorRole: string;
  notes: string;
  lat?: number;
  lng?: number;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'DONATION' | 'RESERVATION' | 'PICKUP' | 'VERIFICATION' | 'SAFETY' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Incident {
  id: string;
  donationId: string;
  reporterId: string;
  reporterEmail: string;
  reason: string;
  description: string;
  status: IncidentStatus;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  timestamp: string;
}

export interface MatchScoreResult {
  donation: Donation;
  score: number;
  distanceKm: number;
  isEligible: boolean;
  factors: {
    distanceScore: number;
    urgencyScore: number;
    capacityScore: number;
    compatibilityScore: number;
  };
  reasons: string[];
}
