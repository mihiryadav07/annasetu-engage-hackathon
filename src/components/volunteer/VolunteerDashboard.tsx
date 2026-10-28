/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  KeyRound,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Compass,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllPickups,
  assignVolunteerToPickup,
  updatePickupMilestone,
} from '../../services/logisticsService';
import { IndiaMapView } from '../maps/IndiaMapView';
import type { Pickup, PickupStatus } from '../../types';

export const VolunteerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  // Handover confirmation modal
  const [activePickupForDelivery, setActivePickupForDelivery] = useState<Pickup | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [deliveredQuantity, setDeliveredQuantity] = useState<number>(15);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadPickups();
  }, [profile]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      const all = await getAllPickups();
      setPickups(all);
    } catch {
      // Seed realistic pickups for instant testing
      const seed: Pickup[] = [
        {
          id: 'pk_demo_01',
          donationId: 'don_seed_01',
          reservationId: 'res_01',
          donorOrgId: 'demo_org_donor_01',
          donorOrgName: 'Grand Pavilion Caterers & Banquets',
          recipientOrgId: 'demo_org_recip_01',
          recipientOrgName: 'Mumbai Food Relief & Community Kitchen',
          volunteerId: profile?.uid || 'demo_volunteer_01',
          volunteerName: profile?.displayName || 'Arjun Deshmukh',
          volunteerPhone: '+91 97690 54321',
          status: 'ARRIVED_AT_PICKUP',
          pickupAddress: 'Plot 44, Worli Sea Face, Worli, Mumbai (400018)',
          pickupLat: 19.0178,
          pickupLng: 72.8173,
          deliveryAddress: 'Building 12, Parel East, Mumbai (400012)',
          deliveryLat: 19.0028,
          deliveryLng: 72.8423,
          collectedQuantity: 25,
          handoverCode: '489215',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'pk_demo_02',
          donationId: 'don_seed_03',
          reservationId: 'res_02',
          donorOrgId: 'demo_org_donor_02',
          donorOrgName: 'Royal Spice Banquet Hall',
          recipientOrgId: 'demo_org_recip_02',
          recipientOrgName: 'Dharavi Children Shelter',
          status: 'ASSIGNED',
          pickupAddress: 'Bandra Kurla Complex, Bandra East, Mumbai (400051)',
          pickupLat: 19.0657,
          pickupLng: 72.8687,
          deliveryAddress: '90 Feet Road, Dharavi, Mumbai (400017)',
          deliveryLat: 19.0434,
          deliveryLng: 72.8567,
          handoverCode: '716390',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setPickups(seed);
    } finally {
      setLoading(false);
    }
  };

  const myAssignedPickups = pickups.filter(
    p => p.volunteerId === (profile?.uid || 'demo_volunteer_01') && p.status !== 'DELIVERED'
  );
  const openOpportunities = pickups.filter(
    p => !p.volunteerId && p.status === 'ASSIGNED'
  );
  const completedDeliveries = pickups.filter(
    p => p.volunteerId === (profile?.uid || 'demo_volunteer_01') && p.status === 'DELIVERED'
  );

  const handleAcceptAssignment = async (pickupId: string) => {
    try {
      await assignVolunteerToPickup(pickupId, {
        id: profile?.uid || 'demo_volunteer_01',
        name: profile?.displayName || 'Arjun Deshmukh',
        phone: profile?.phone || '+91 97690 54321',
      });
      await loadPickups();
    } catch (err: any) {
      alert(err.message || 'Failed to accept assignment');
    }
  };

  const handleAdvanceMilestone = async (pickup: Pickup, nextStatus: PickupStatus) => {
    if (nextStatus === 'DELIVERED') {
      setActivePickupForDelivery(pickup);
      setDeliveredQuantity(pickup.collectedQuantity || 15);
      setEnteredCode('');
      setCodeError(null);
      return;
    }

    try {
      const res = await updatePickupMilestone({
        pickupId: pickup.id,
        newStatus: nextStatus,
        actorId: profile?.uid || 'demo_volunteer_01',
        actorRole: 'VOLUNTEER',
        collectedQuantity: nextStatus === 'COLLECTED' ? 25 : undefined,
      });

      if (res.success) {
        await loadPickups();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Milestone update failed');
    }
  };

  const handleVerifyHandoverAndDeliver = async () => {
    if (!activePickupForDelivery) return;
    if (!enteredCode.trim() || enteredCode.trim().length !== 6) {
      setCodeError('Handover confirmation code must be exactly 6 digits.');
      return;
    }

    setVerifying(true);
    setCodeError(null);

    try {
      const res = await updatePickupMilestone({
        pickupId: activePickupForDelivery.id,
        newStatus: 'DELIVERED',
        actorId: profile?.uid || 'demo_volunteer_01',
        actorRole: 'VOLUNTEER',
        providedHandoverCode: enteredCode.trim(),
        deliveredQuantity: Number(deliveredQuantity),
        notes: `Physical handover verified with single-use code. Delivered ${deliveredQuantity} portions.`,
      });

      if (!res.success) {
        setCodeError(res.message);
        return;
      }

      setActivePickupForDelivery(null);
      await loadPickups();
    } catch (err: any) {
      setCodeError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const getNextMilestone = (current: PickupStatus): { label: string; next: PickupStatus } | null => {
    switch (current) {
      case 'ASSIGNED':
        return { label: 'Start Route (En Route to Donor)', next: 'EN_ROUTE_TO_PICKUP' };
      case 'EN_ROUTE_TO_PICKUP':
        return { label: 'Arrived at Donor Kitchen', next: 'ARRIVED_AT_PICKUP' };
      case 'ARRIVED_AT_PICKUP':
        return { label: 'Collect Food from Donor', next: 'COLLECTED' };
      case 'COLLECTED':
        return { label: 'En Route to NGO Shelter', next: 'EN_ROUTE_TO_RECIPIENT' };
      case 'EN_ROUTE_TO_RECIPIENT':
        return { label: 'Arrived at NGO Destination', next: 'ARRIVED_AT_RECIPIENT' };
      case 'ARRIVED_AT_RECIPIENT':
        return { label: 'Verify Code & Complete Handover', next: 'DELIVERED' };
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Volunteer Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl shadow-inner">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                {profile?.displayName || 'Volunteer Logistics Desk'}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Authorized Courier
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              Phone: {profile?.phone || '+91 97690 54321'} • Active Deliveries: {myAssignedPickups.length} • Completed: {completedDeliveries.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200 text-xs text-stone-700">
          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Cold-chain & hot food delivery protocol active</span>
        </div>
      </motion.div>

      {/* Active Deliveries */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-700" />
          <span>My Active Redistribution Missions ({myAssignedPickups.length})</span>
        </h2>

        {myAssignedPickups.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-3xl border border-stone-200 text-stone-500 text-xs">
            You currently have no active deliveries in progress. Check available opportunities below!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myAssignedPickups.map((pk, idx) => {
              const nextStep = getNextMilestone(pk.status);

              return (
                <motion.div
                  key={pk.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className="bg-white rounded-3xl border-2 border-emerald-600/40 shadow-md p-6 space-y-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        Current Milestone: {pk.status.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-stone-900 mt-2">
                        {pk.donorOrgName} → {pk.recipientOrgName}
                      </h3>
                    </div>

                    {nextStep && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAdvanceMilestone(pk, nextStep.next)}
                        className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition flex items-center gap-2 text-xs cursor-pointer"
                      >
                        <span>{nextStep.label}</span>
                        <ArrowRight className="w-4 h-4 text-amber-300" />
                      </motion.button>
                    )}
                  </div>

                  {/* Route corridor map visualizer */}
                  <IndiaMapView
                    pickupAddress={pk.pickupAddress}
                    pickupLat={pk.pickupLat}
                    pickupLng={pk.pickupLng}
                    deliveryAddress={pk.deliveryAddress}
                    deliveryLat={pk.deliveryLat}
                    deliveryLng={pk.deliveryLng}
                    donorName={pk.donorOrgName}
                    recipientName={pk.recipientOrgName}
                    status={pk.status}
                  />

                  {/* Stepper Status tracker */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { s: 'ASSIGNED', l: '1. Assigned' },
                      { s: 'ARRIVED_AT_PICKUP', l: '2. At Donor' },
                      { s: 'COLLECTED', l: '3. In Transit' },
                      { s: 'ARRIVED_AT_RECIPIENT', l: '4. At Dropoff' },
                    ].map(step => (
                      <div
                        key={step.s}
                        className={`p-2.5 rounded-xl border text-center font-medium transition-colors ${
                          pk.status === step.s
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm font-bold'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        {step.l}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Open Available Opportunities */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-600" />
          <span>Open Pickup Requests in Your Corridor ({openOpportunities.length})</span>
        </h2>

        {openOpportunities.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-3xl border border-stone-200 text-stone-500 text-xs">
            No unclaimed routes in your area at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openOpportunities.map((opp, idx) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Unassigned Pickup
                    </span>
                    <span className="text-xs text-stone-400 font-mono">{opp.id}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      {opp.donorOrgName} → {opp.recipientOrgName}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">Pickup: {opp.pickupAddress}</p>
                    <p className="text-xs text-stone-500">Destination: {opp.deliveryAddress}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAcceptAssignment(opp.id)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Route Assignment</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Handover Code Verification Modal with AnimatePresence */}
      <AnimatePresence>
        {activePickupForDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePickupForDelivery(null)}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden z-10"
            >
              <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base">Verify Recipient Handover Code</h3>
                  <p className="text-xs text-emerald-200">Tamper-evident single-use delivery verification</p>
                </div>
                <button
                  onClick={() => setActivePickupForDelivery(null)}
                  className="text-emerald-300 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {codeError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    <span>{codeError}</span>
                  </motion.div>
                )}

                <p className="text-stone-600 leading-relaxed">
                  Ask the recipient NGO representative for their single-use 6-digit confirmation code displayed on their dashboard.
                </p>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    6-Digit Handover Confirmation Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredCode}
                    onChange={e => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-widest text-2xl font-black font-mono py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-600"
                    placeholder="000000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Delivered Portion Count (Verified)
                  </label>
                  <input
                    type="number"
                    value={deliveredQuantity}
                    onChange={e => setDeliveredQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePickupForDelivery(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleVerifyHandoverAndDeliver}
                    disabled={verifying}
                    className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4 text-amber-300" />
                    <span>{verifying ? 'Verifying OTP...' : 'Authenticate & Complete Delivery'}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
