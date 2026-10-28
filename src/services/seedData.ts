/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  Organization,
  Donation,
  Pickup,
  DeliveryEvent,
  Incident,
  AuditLog,
  Notification,
  Reservation,
} from '../types';

/**
 * 2 Demonstrative Real Datasets for Every Usecase:
 *
 * Usecase 1: Commercial Food Donors (Mumbai & New Delhi)
 * Usecase 2: Verified Recipient NGOs & Community Kitchens (Mumbai & New Delhi)
 * Usecase 3: Volunteer Couriers (Mumbai & New Delhi)
 * Usecase 4: Surplus Food Donations (Hot cooked buffet & Bakery/Groceries)
 * Usecase 5: Safety Hold / Temperature Deviation Case (Emergency Circuit Breaker)
 * Usecase 6: Concurrency Reservations & Claims
 * Usecase 7: Active Route Coordination & Milestone Logistics
 * Usecase 8: Completed Delivery Handover with 6-digit single-use OTP
 * Usecase 9: Safety Incidents (Active Investigation & Resolved)
 * Usecase 10: Immutable System Audit Logs
 * Usecase 11: Persistent Transactional Notifications
 */

export const DEMO_ORGANIZATIONS: Organization[] = [
  // 1. Food Donor 1: Luxury Banquet & Catering in Worli, Mumbai
  {
    id: 'org_donor_mumbai_01',
    name: 'Grand Pavilion Caterers & Banquets',
    type: 'DONOR',
    category: 'Commercial Caterer & Banquet',
    fssaiNumber: '11521018000342', // Valid 14-digit FSSAI
    contactName: 'Vikram Mehta',
    contactPhone: '+91 98200 12345',
    contactEmail: 'operations@grandpavilionmumbai.com',
    address: 'Plot 44, Worli Sea Face, Worli',
    city: 'Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    pinCode: '400018',
    country: 'IN',
    lat: 19.0178,
    lng: 72.8173,
    verificationStatus: 'VERIFIED',
    verificationNotes: 'FSSAI License verified via FoSCoS portal on 12-Oct-2026',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
  // 2. Food Donor 2: Heritage Hotel & Convention Center in Chanakyapuri, New Delhi
  {
    id: 'org_donor_delhi_02',
    name: 'The Imperial Heritage Hotel & Kitchens',
    type: 'DONOR',
    category: '5-Star Hotel Kitchen',
    fssaiNumber: '13320005001289', // Valid 14-digit FSSAI
    contactName: 'Chef Sanjeev Anand',
    contactPhone: '+91 98110 54321',
    contactEmail: 'fnb@imperialheritagedelhi.in',
    address: '1 Sardar Patel Marg, Diplomatic Enclave, Chanakyapuri',
    city: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    pinCode: '110021',
    country: 'IN',
    lat: 28.5983,
    lng: 77.1824,
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Central FSSAI License & Hygiene Rating 5-Star verified',
    createdAt: '2026-10-16T11:30:00.000Z',
    updatedAt: '2026-10-16T11:30:00.000Z',
  },
  // 3. Recipient NGO 1: Community Kitchen in Parel, Mumbai
  {
    id: 'org_recip_mumbai_01',
    name: 'Mumbai Food Relief & Community Kitchen',
    type: 'RECIPIENT',
    category: 'Community Kitchen & Shelter',
    registrationNumber: 'NGO-DARPAN-MH/2019/024819',
    contactName: 'Sunita Sharma',
    contactPhone: '+91 98201 67890',
    contactEmail: 'coordinator@mumbaifoodrelief.org',
    address: 'Building 12, Parel East, Near KEM Hospital',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pinCode: '400012',
    country: 'IN',
    lat: 19.0028,
    lng: 72.8423,
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Darpan registration & 12A/80G status confirmed',
    servingCapacity: 450,
    dietaryRequirements: 'Vegetarian and Halal friendly',
    createdAt: '2026-10-14T09:00:00.000Z',
    updatedAt: '2026-10-14T09:00:00.000Z',
  },
  // 4. Recipient NGO 2: Shelter Home & Night Kitchen in Nizamuddin, New Delhi
  {
    id: 'org_recip_delhi_02',
    name: 'Asha Kiran Hope Shelter & Meals',
    type: 'RECIPIENT',
    category: 'Youth & Elderly Care Shelter',
    registrationNumber: 'NGO-DARPAN-DL/2021/038912',
    contactName: 'Rohan Mathur',
    contactPhone: '+91 98108 77665',
    contactEmail: 'director@ashakirandelhi.org',
    address: 'Near Dargah Complex, West Nizamuddin',
    city: 'New Delhi',
    district: 'South East Delhi',
    state: 'Delhi',
    pinCode: '110013',
    country: 'IN',
    lat: 28.5885,
    lng: 77.2458,
    verificationStatus: 'VERIFIED',
    verificationNotes: 'FCRA & Darpan certified',
    servingCapacity: 300,
    dietaryRequirements: 'Vegetarian only',
    createdAt: '2026-10-15T14:00:00.000Z',
    updatedAt: '2026-10-15T14:00:00.000Z',
  },
  // 5. Pending Verification Donor (for Admin Queue testing)
  {
    id: 'org_pending_donor_03',
    name: 'Shree Krishna Banquets & Caterers',
    type: 'DONOR',
    category: 'Banqueting Hall',
    fssaiNumber: '11522020000491',
    contactName: 'Girish Patel',
    contactPhone: '+91 98205 44332',
    contactEmail: 'girish@shreekrishnabanquets.in',
    address: 'SV Road, Andheri West',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pinCode: '400058',
    country: 'IN',
    lat: 19.1197,
    lng: 72.8468,
    verificationStatus: 'PENDING_VERIFICATION',
    createdAt: '2026-10-27T08:00:00.000Z',
    updatedAt: '2026-10-27T08:00:00.000Z',
  },
];

export const DEMO_DONATIONS: Donation[] = [
  // Donation 1: Hot Insulated Cooked Buffet Meals (Mumbai)
  {
    id: 'don_mumbai_01',
    donorId: 'user_donor_mumbai_01',
    donorOrgId: 'org_donor_mumbai_01',
    donorOrgName: 'Grand Pavilion Caterers & Banquets',
    foodName: 'Paneer Butter Masala & Jeera Pulao',
    description: 'Fresh surplus preparation from banquet wedding reception. Held continuously in thermal food pan carriers.',
    category: 'COOKED_MEALS',
    quantity: 30,
    unit: 'KG',
    estimatedServings: 110,
    dietaryType: 'VEG',
    allergens: 'Dairy (Paneer, Butter, Cream)',
    cookedOrPackedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    storageType: 'HOT_INSULATED',
    temperatureCelsius: 68,
    packagingDetails: 'Insulated Cambro food transport boxes with silicone seals',
    address: 'Plot 44, Worli Sea Face, Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400018',
    country: 'IN',
    lat: 19.0178,
    lng: 72.8173,
    earliestCollectionTime: new Date(Date.now() - 1800000).toISOString(),
    latestSafeCollectionDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: 'AVAILABLE',
    reservedQuantity: 0,
    collectedQuantity: 0,
    deliveredQuantity: 0,
    safetyDeclarationAccepted: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  // Donation 2: Hot Fresh Dal Tadka & Chapati Racks (New Delhi)
  {
    id: 'don_delhi_02',
    donorId: 'user_donor_delhi_02',
    donorOrgId: 'org_donor_delhi_02',
    donorOrgName: 'The Imperial Heritage Hotel & Kitchens',
    foodName: 'Yellow Dal Tadka & 350 Whole Wheat Phulkas',
    description: 'Surplus buffet stock from afternoon corporate summit. Untouched, hygienically wrapped in food-grade silver foil.',
    category: 'COOKED_MEALS',
    quantity: 25,
    unit: 'KG',
    estimatedServings: 95,
    dietaryType: 'VEG',
    allergens: 'Gluten (Wheat)',
    cookedOrPackedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    storageType: 'HOT_INSULATED',
    temperatureCelsius: 65,
    packagingDetails: 'Thermal aluminum meal trays with heavy-duty foil lids',
    address: '1 Sardar Patel Marg, Chanakyapuri',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110021',
    country: 'IN',
    lat: 28.5983,
    lng: 77.1824,
    earliestCollectionTime: new Date(Date.now() - 1800000).toISOString(),
    latestSafeCollectionDeadline: new Date(Date.now() + 5 * 3600000).toISOString(),
    status: 'RESERVED',
    reservedQuantity: 25,
    collectedQuantity: 0,
    deliveredQuantity: 0,
    safetyDeclarationAccepted: true,
    createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
  },
  // Donation 3: Bakery & Artisanal Multigrain Breads (Mumbai)
  {
    id: 'don_mumbai_03',
    donorId: 'user_donor_mumbai_01',
    donorOrgId: 'org_donor_mumbai_01',
    donorOrgName: 'Grand Pavilion Caterers & Banquets',
    foodName: 'Whole Wheat Sandwich Loaves & Dinner Rolls',
    description: 'Fresh morning bake surplus from confectionery bakery. Packaged in sealed food-grade paper liners.',
    category: 'BAKERY',
    quantity: 18,
    unit: 'KG',
    estimatedServings: 70,
    dietaryType: 'VEG',
    allergens: 'Gluten, Yeast',
    cookedOrPackedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    storageType: 'ROOM_TEMP',
    packagingDetails: 'Wax paper wrapping in ventilated food crates',
    address: 'Plot 44, Worli Sea Face, Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400018',
    country: 'IN',
    lat: 19.0178,
    lng: 72.8173,
    earliestCollectionTime: new Date().toISOString(),
    latestSafeCollectionDeadline: new Date(Date.now() + 18 * 3600000).toISOString(),
    status: 'AVAILABLE',
    reservedQuantity: 0,
    collectedQuantity: 0,
    deliveredQuantity: 0,
    safetyDeclarationAccepted: true,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  // Donation 4: Safety Hold Incident Case (Emergency Circuit Breaker Triggered)
  {
    id: 'don_safety_hold_04',
    donorId: 'user_donor_mumbai_01',
    donorOrgId: 'org_donor_mumbai_01',
    donorOrgName: 'Grand Pavilion Caterers & Banquets',
    foodName: 'Mixed Vegetable Curry with Paneer',
    description: 'Evening catering batch placed on precautionary hold due to reported courier seal looseness.',
    category: 'COOKED_MEALS',
    quantity: 20,
    unit: 'KG',
    estimatedServings: 65,
    dietaryType: 'VEG',
    allergens: 'Dairy',
    cookedOrPackedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    storageType: 'HOT_INSULATED',
    temperatureCelsius: 58,
    packagingDetails: 'Standard catering pans',
    address: 'Plot 44, Worli Sea Face, Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400018',
    country: 'IN',
    lat: 19.0178,
    lng: 72.8173,
    earliestCollectionTime: new Date().toISOString(),
    latestSafeCollectionDeadline: new Date(Date.now() + 2 * 3600000).toISOString(),
    status: 'SAFETY_HOLD',
    reservedQuantity: 0,
    collectedQuantity: 0,
    deliveredQuantity: 0,
    safetyDeclarationAccepted: true,
    safetyHoldReason: 'Precautionary hold triggered: Volunteer reported container lid seal displacement during transit.',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];

export const DEMO_PICKUPS: Pickup[] = [
  // Pickup 1: Active in Transit in Mumbai (Worli to Parel) with Handover Code
  {
    id: 'pk_active_mumbai_01',
    donationId: 'don_mumbai_01',
    reservationId: 'res_mumbai_01',
    donorOrgId: 'org_donor_mumbai_01',
    donorOrgName: 'Grand Pavilion Caterers & Banquets',
    recipientOrgId: 'org_recip_mumbai_01',
    recipientOrgName: 'Mumbai Food Relief & Community Kitchen',
    volunteerId: 'demo_volunteer_01',
    volunteerName: 'Arjun Deshmukh',
    volunteerPhone: '+91 97690 54321',
    status: 'EN_ROUTE_TO_RECIPIENT',
    pickupAddress: 'Plot 44, Worli Sea Face, Worli, Mumbai (400018)',
    pickupLat: 19.0178,
    pickupLng: 72.8173,
    deliveryAddress: 'Building 12, Parel East, Mumbai (400012)',
    deliveryLat: 19.0028,
    deliveryLng: 72.8423,
    collectedQuantity: 30,
    handoverCode: '489215', // 6-digit expiring verification code
    assignedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    collectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  // Pickup 2: Successfully Delivered with Code in New Delhi (Chanakyapuri to Nizamuddin)
  {
    id: 'pk_delivered_delhi_02',
    donationId: 'don_delhi_02',
    reservationId: 'res_delhi_02',
    donorOrgId: 'org_donor_delhi_02',
    donorOrgName: 'The Imperial Heritage Hotel & Kitchens',
    recipientOrgId: 'org_recip_delhi_02',
    recipientOrgName: 'Asha Kiran Hope Shelter & Meals',
    volunteerId: 'demo_volunteer_delhi_02',
    volunteerName: 'Rahul Verma',
    volunteerPhone: '+91 98114 98765',
    status: 'DELIVERED',
    pickupAddress: '1 Sardar Patel Marg, Diplomatic Enclave, Chanakyapuri, New Delhi (110021)',
    pickupLat: 28.5983,
    pickupLng: 77.1824,
    deliveryAddress: 'Near Dargah Complex, West Nizamuddin, New Delhi (110013)',
    deliveryLat: 28.5885,
    deliveryLng: 77.2458,
    collectedQuantity: 25,
    deliveredQuantity: 25,
    handoverCode: '716390',
    assignedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    collectedAt: new Date(Date.now() - 2.2 * 3600000).toISOString(),
    deliveredAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
  },
];

export const DEMO_INCIDENTS: Incident[] = [
  // Incident 1: Active investigation of seal condition
  {
    id: 'inc_investigating_01',
    donationId: 'don_safety_hold_04',
    reporterId: 'demo_volunteer_01',
    reporterEmail: 'arjun.deshmukh@gmail.com',
    reason: 'Container Seal Looseness on Crate 2',
    description: 'During vehicle loading at Worli kitchen, courier observed silicone seal clasp on crate 2 was unlatched. Donation frozen under Safety Hold pending kitchen supervisor verification.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  // Incident 2: Resolved temperature incident with full traceability
  {
    id: 'inc_resolved_02',
    donationId: 'don_delhi_02',
    reporterId: 'demo_recipient_delhi_02',
    reporterEmail: 'director@ashakirandelhi.org',
    reason: 'Heavy Rain Transit Delay Alert',
    description: 'Courier route delayed by 35 minutes due to sudden monsoon waterlogging on Barapullah flyover.',
    status: 'RESOLVED',
    resolutionNotes: 'Calibrated core temperature reading upon arrival verified at 64.2°C (above 60°C requirement). Food confirmed safe and served immediately.',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
  },
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_audit_01',
    actorId: 'admin_mihir',
    actorEmail: 'mihiryadav1100@gmail.com',
    action: 'ORGANIZATION_VERIFIED',
    resourceType: 'ORGANIZATION',
    resourceId: 'org_donor_mumbai_01',
    details: 'Verified 14-digit FSSAI license 11521018000342 against Indian FoSCoS registry.',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'log_audit_02',
    actorId: 'system_circuit_breaker',
    actorEmail: 'safety-bot@annasetu.in',
    action: 'EMERGENCY_SAFETY_HOLD_TRIGGERED',
    resourceType: 'DONATION',
    resourceId: 'don_safety_hold_04',
    details: 'Auto-suspended recipient matching following incident inc_investigating_01.',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'log_audit_03',
    actorId: 'demo_volunteer_delhi_02',
    actorEmail: 'rahul.verma@delhicouriers.in',
    action: 'HANDOVER_CODE_AUTHENTICATED',
    resourceType: 'PICKUP',
    resourceId: 'pk_delivered_delhi_02',
    details: 'Recipient confirmed physical delivery using OTP 716390. Verified 25 KG hot meals.',
    timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(),
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_demo_01',
    userId: 'demo_donor_01',
    title: 'Surplus Batch Picked Up',
    message: 'Volunteer Arjun Deshmukh collected 30 KG Paneer Butter Masala & Pulao for Mumbai Community Kitchen.',
    type: 'PICKUP',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'notif_demo_02',
    userId: 'demo_recipient_01',
    title: 'Volunteer In Transit',
    message: 'Pickup pk_active_mumbai_01 is en route to your Parel kitchen. Have your 6-digit code (489215) ready.',
    type: 'PICKUP',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'notif_demo_03',
    userId: 'demo_admin_01',
    title: 'FSSAI Verification Pending',
    message: 'Shree Krishna Banquets (SV Road, Mumbai) submitted license 11522020000491 for platform approval.',
    type: 'VERIFICATION',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

/**
 * Seeds Firestore with the 2 demonstrative datasets for each usecase
 */
export async function seedDemonstrativeDataToFirestore(): Promise<{ success: boolean; count: number }> {
  let count = 0;
  try {
    // 1. Organizations
    for (const org of DEMO_ORGANIZATIONS) {
      await setDoc(doc(db, 'organizations', org.id), org);
      count++;
    }

    // 2. Donations
    for (const don of DEMO_DONATIONS) {
      await setDoc(doc(db, 'donations', don.id), don);
      count++;
    }

    // 3. Pickups
    for (const pk of DEMO_PICKUPS) {
      await setDoc(doc(db, 'pickups', pk.id), pk);
      count++;
    }

    // 4. Incidents
    for (const inc of DEMO_INCIDENTS) {
      await setDoc(doc(db, 'incidents', inc.id), inc);
      count++;
    }

    // 5. Audit Logs
    for (const log of DEMO_AUDIT_LOGS) {
      await setDoc(doc(db, 'audit_logs', log.id), log);
      count++;
    }

    // 6. Notifications
    for (const notif of DEMO_NOTIFICATIONS) {
      await setDoc(doc(db, 'notifications', notif.id), notif);
      count++;
    }

    return { success: true, count };
  } catch (e) {
    console.warn('Seeding to Firestore encountered permission or network limitation, using in-memory state:', e);
    return { success: false, count };
  }
}
