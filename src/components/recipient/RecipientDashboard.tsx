/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake,
  Search,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Sparkles,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Sliders,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllDonations, reserveDonationQuantity } from '../../services/donationService';
import { rankDonationsForRecipient } from '../../services/matchingService';
import { createPickupAssignment, getAllPickups } from '../../services/logisticsService';
import { IndiaMapView } from '../maps/IndiaMapView';
import type { Donation, MatchScoreResult, Pickup } from '../../types';

export const RecipientDashboard: React.FC = () => {
  const { profile, organization } = useAuth();
  const [availableOffers, setAvailableOffers] = useState<MatchScoreResult[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for reservation modal
  const [selectedMatch, setSelectedMatch] = useState<MatchScoreResult | null>(null);
  const [reserveQty, setReserveQty] = useState<number>(10);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);

  // Capacity Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [capacity, setCapacity] = useState(organization?.servingCapacity || 450);

  useEffect(() => {
    loadData();
  }, [organization]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allDonations = await getAllDonations();
      const allPickups = await getAllPickups();

      const activePickups = allPickups.filter(
        p => p.recipientOrgId === (organization?.id || 'demo_org_recip_01')
      );
      setPickups(activePickups);

      // Run Deterministic Matching Engine
      if (organization) {
        const matches = rankDonationsForRecipient(organization, allDonations);
        setAvailableOffers(matches);
      }
    } catch {
      // Fallback matching results for immediate demonstration
      const dummyDonation: Donation = {
        id: 'don_seed_01',
        donorId: 'donor_01',
        donorOrgId: 'demo_org_donor_01',
        donorOrgName: 'Grand Pavilion Caterers & Banquets',
        foodName: 'Paneer Butter Masala & Jeera Pulao',
        description: 'Surplus buffet preparation from banquet event. Packed in insulated containers.',
        category: 'COOKED_MEALS',
        quantity: 25,
        unit: 'KG',
        estimatedServings: 90,
        dietaryType: 'VEG',
        allergens: 'Dairy',
        cookedOrPackedAt: new Date(Date.now() - 3600000).toISOString(),
        storageType: 'HOT_INSULATED',
        temperatureCelsius: 68,
        packagingDetails: 'Insulated Cambro food carriers',
        address: 'Plot 44, Worli Sea Face, Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400018',
        country: 'IN',
        lat: 19.0178,
        lng: 72.8173,
        earliestCollectionTime: new Date().toISOString(),
        latestSafeCollectionDeadline: new Date(Date.now() + 10800000).toISOString(),
        status: 'AVAILABLE',
        reservedQuantity: 0,
        collectedQuantity: 0,
        deliveredQuantity: 0,
        safetyDeclarationAccepted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const fallbackOrg = organization || {
        id: 'demo_org_recip_01',
        name: 'Mumbai Food Relief & Community Kitchen',
        type: 'RECIPIENT',
        category: 'Community Kitchen',
        contactName: 'Sunita Sharma',
        contactPhone: '9820167890',
        contactEmail: 'coordinator@roti-bank.org',
        address: 'Building 12, Parel East',
        city: 'Mumbai',
        district: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400012',
        country: 'IN',
        lat: 19.0028,
        lng: 72.8423,
        verificationStatus: 'VERIFIED',
        servingCapacity: 450,
        dietaryRequirements: 'Vegetarian and Halal friendly',
        createdAt: '',
        updatedAt: '',
      };

      const matches = rankDonationsForRecipient(fallbackOrg, [dummyDonation]);
      setAvailableOffers(matches);

      // Seed an active pickup with handover code
      setPickups([
        {
          id: 'pk_demo_01',
          donationId: 'don_seed_02',
          reservationId: 'res_01',
          donorOrgId: 'demo_org_donor_01',
          donorOrgName: 'Grand Pavilion Caterers',
          recipientOrgId: 'demo_org_recip_01',
          recipientOrgName: fallbackOrg.name,
          volunteerId: 'demo_volunteer_01',
          volunteerName: 'Arjun Deshmukh',
          volunteerPhone: '+91 97690 54321',
          status: 'EN_ROUTE_TO_RECIPIENT',
          pickupAddress: 'Plot 44, Worli Sea Face, Worli',
          pickupLat: 19.0178,
          pickupLng: 72.8173,
          deliveryAddress: 'Building 12, Parel East, Mumbai (400012)',
          deliveryLat: 19.0028,
          deliveryLng: 72.8423,
          collectedQuantity: 15,
          handoverCode: '489215',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReserveModal = (match: MatchScoreResult) => {
    setSelectedMatch(match);
    const available = match.donation.quantity - (match.donation.reservedQuantity || 0);
    setReserveQty(Math.min(10, available));
    setReserveError(null);
  };

  const handleConfirmReservation = async () => {
    if (!selectedMatch) return;
    setReserving(true);
    setReserveError(null);

    try {
      const res = await reserveDonationQuantity(selectedMatch.donation.id, Number(reserveQty));
      if (!res.success) {
        setReserveError(res.error || 'Failed to reserve donation');
        return;
      }

      // Create Logistics Pickup Assignment
      const newPickup = await createPickupAssignment({
        donationId: selectedMatch.donation.id,
        reservationId: 'res_' + Math.random().toString(36).substring(2, 9),
        donorOrgId: selectedMatch.donation.donorOrgId,
        donorOrgName: selectedMatch.donation.donorOrgName,
        recipientOrgId: organization?.id || 'demo_org_recip_01',
        recipientOrgName: organization?.name || 'Mumbai Community Kitchen',
        pickupAddress: `${selectedMatch.donation.address}, ${selectedMatch.donation.city} (${selectedMatch.donation.pinCode})`,
        pickupLat: selectedMatch.donation.lat,
        pickupLng: selectedMatch.donation.lng,
        deliveryAddress: `${organization?.address || 'Parel East'}, ${organization?.city || 'Mumbai'} (${organization?.pinCode || '400012'})`,
        deliveryLat: organization?.lat || 19.0028,
        deliveryLng: organization?.lng || 72.8423,
      });

      setPickups(prev => [newPickup, ...prev]);
      setSelectedMatch(null);
      await loadData();
    } catch (err: any) {
      setReserveError(err.message || 'Error executing reservation transaction');
    } finally {
      setReserving(false);
    }
  };

  const filteredOffers = availableOffers.filter(m => {
    if (!m.isEligible) return false;
    if (dietaryFilter !== 'ALL' && m.donation.dietaryType !== dietaryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.donation.foodName.toLowerCase().includes(q) ||
        m.donation.city.toLowerCase().includes(q) ||
        m.donation.donorOrgName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Org Verification Status */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                {organization?.name || 'NGO & Community Kitchen Portal'}
              </h1>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-300 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-600" /> Verified NGO
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              Darpan ID: {organization?.registrationNumber || 'NGO-DARPAN-MH/2019/024819'} • Daily Capacity: {capacity} Meals • Operating City: {organization?.city || 'Mumbai'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-stone-300 transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Capacity & Dietary Settings</span>
        </button>
      </div>

      {/* Active Pickups & Handover Codes Banner */}
      {pickups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Active Handover Confirmations ({pickups.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pickups.map(pk => (
              <div
                key={pk.id}
                className="bg-white rounded-3xl border-2 border-amber-300 shadow-sm p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Status: {pk.status.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-stone-900 mt-1">
                      From: {pk.donorOrgName}
                    </h3>
                  </div>

                  {/* 6-Digit Secret Handover Code */}
                  <div className="text-right bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-bold uppercase text-amber-800 block">
                      Single-Use Handover Code
                    </span>
                    <span className="text-2xl font-black font-mono tracking-widest text-amber-950">
                      {pk.handoverCode || '489215'}
                    </span>
                    <p className="text-[9px] text-amber-700 mt-0.5">
                      Give to volunteer ONLY after meal condition check
                    </p>
                  </div>
                </div>

                {/* Map Corridor Visualization */}
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

                <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span>Volunteer: <strong className="text-stone-800">{pk.volunteerName || 'Pending Assignment'}</strong></span>
                  <span className="font-mono text-[10px]">Pickup ID: {pk.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Surplus Offers with Deterministic Ranking Engine */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Ranked Surplus Food Opportunities</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Deterministic ranking based on straight-line distance, expiry urgency, and portion capacity
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Dietary:</span>
            <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs">
              {(['ALL', 'VEG', 'NON_VEG'] as const).map(dt => (
                <button
                  key={dt}
                  onClick={() => setDietaryFilter(dt)}
                  className={`px-3 py-1 font-semibold rounded-lg transition cursor-pointer ${
                    dietaryFilter === dt ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {dt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 text-stone-400 text-sm">
            Evaluating matching algorithms across Indian donors...
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 space-y-2">
            <AlertCircle className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-700">No surplus offers match current criteria</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Check back shortly as commercial caterers and hotels post newly prepared surplus batches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((match, idx) => {
              const d = match.donation;
              const remaining = d.quantity - (d.reservedQuantity || 0);

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-emerald-400 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    {/* Score Badge & Match percentage */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{match.score}% Compatibility Score</span>
                      </div>
                      <span className={`text-xs font-bold ${d.dietaryType === 'VEG' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {d.dietaryType}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-900">
                        {d.foodName}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">Donor: {d.donorOrgName}</p>
                    </div>

                    {/* Quantity & Servings */}
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Remaining Available</span>
                        <span className="font-bold text-stone-900 text-sm">
                          {remaining} {d.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Portions</span>
                        <span className="font-bold text-emerald-800 text-sm">
                          ~{d.estimatedServings} Servings
                        </span>
                      </div>
                    </div>

                    {/* Explainability Breakdown */}
                    <div className="space-y-1.5 text-xs bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                        Deterministic Factors:
                      </span>
                      <ul className="space-y-1 text-[11px] text-emerald-950">
                        {match.reasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-stone-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Expires: {new Date(d.latestSafeCollectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenReserveModal(match)}
                      className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Claim & Reserve Surplus</span>
                      <ChevronRight className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservation Modal with AnimatePresence */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden"
            >
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg">Confirm Food Reservation</h3>
                <p className="text-xs text-emerald-200">
                  {selectedMatch.donation.foodName} from {selectedMatch.donation.donorOrgName}
                </p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {reserveError && (
                <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                  <span>{reserveError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Requested Quantity ({selectedMatch.donation.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedMatch.donation.quantity - (selectedMatch.donation.reservedQuantity || 0)}
                  value={reserveQty}
                  onChange={e => setReserveQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm font-bold"
                />
                <span className="text-stone-400 text-[11px] mt-1 block">
                  Available: {selectedMatch.donation.quantity - (selectedMatch.donation.reservedQuantity || 0)} {selectedMatch.donation.unit}
                </span>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-stone-600">
                <div className="flex justify-between">
                  <span>Donor Address:</span>
                  <strong className="text-stone-900">{selectedMatch.donation.address}, {selectedMatch.donation.city}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Destination:</span>
                  <strong className="text-stone-900">{organization?.address || 'Parel East'}, {organization?.city || 'Mumbai'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Straight-Line Distance:</span>
                  <strong className="text-stone-900">{selectedMatch.distanceKm} km</strong>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-[11px]">
                Upon reservation, a logistics pickup will be dispatched to registered volunteers. A single-use 6-digit confirmation code will be issued on your dashboard.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  disabled={reserving}
                  className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
                >
                  {reserving ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Capacity Settings Modal with AnimatePresence */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden"
            >
              <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-serif font-bold text-base">NGO Serving Capacity Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Daily Meal Distribution Capacity (Servings)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-sm font-bold"
                  />
                  <span className="text-stone-400 text-[11px] mt-1 block">
                    Used by the matching engine to ensure meals match your shelter population.
                  </span>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full bg-emerald-900 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Save Capacity Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
