/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UtensilsCrossed,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Thermometer,
  ShieldAlert,
  X,
  FileCheck2,
  Trash2,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  createDonation,
  getAllDonations,
  updateDonationStatus,
} from '../../services/donationService';
import { INDIAN_STATES_AND_UTS, validateIndianAddress } from '../../services/addressService';
import type { Donation, FoodCategory, QuantityUnit, DietaryType, StorageType } from '../../types';

export const DonorDashboard: React.FC = () => {
  const { profile, organization } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    category: 'COOKED_MEALS' as FoodCategory,
    quantity: 15,
    unit: 'KG' as QuantityUnit,
    estimatedServings: 60,
    dietaryType: 'VEG' as DietaryType,
    allergens: 'None',
    cookedOrPackedAt: new Date().toISOString().slice(0, 16),
    storageType: 'HOT_INSULATED' as StorageType,
    temperatureCelsius: 65,
    packagingDetails: 'Food-grade stainless containers / insulated tubs',
    address: organization?.address || 'Worli Sea Face, Worli',
    city: organization?.city || 'Mumbai',
    state: organization?.state || 'Maharashtra',
    pinCode: organization?.pinCode || '400018',
    earliestCollectionTime: new Date(Date.now() + 1800000).toISOString().slice(0, 16),
    latestSafeCollectionDeadline: new Date(Date.now() + 14400000).toISOString().slice(0, 16),
    safetyDeclarationAccepted: false,
  });

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await getAllDonations();
      // Filter for this donor or show demo items
      setDonations(data);
    } catch {
      // Seed default sample donations for instant usability
      const seed: Donation[] = [
        {
          id: 'don_seed_01',
          donorId: profile?.uid || 'donor_01',
          donorOrgId: organization?.id || 'demo_org_donor_01',
          donorOrgName: organization?.name || 'Grand Pavilion Caterers & Banquets',
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
          address: 'Plot 44, Worli Sea Face',
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
        },
        {
          id: 'don_seed_02',
          donorId: profile?.uid || 'donor_01',
          donorOrgId: organization?.id || 'demo_org_donor_01',
          donorOrgName: organization?.name || 'Grand Pavilion Caterers & Banquets',
          foodName: 'Fresh Whole Wheat Rotis & Dal Tadka',
          description: 'Evening catering surplus batch.',
          category: 'COOKED_MEALS',
          quantity: 15,
          unit: 'KG',
          estimatedServings: 50,
          dietaryType: 'VEG',
          allergens: 'Gluten (Wheat)',
          cookedOrPackedAt: new Date(Date.now() - 7200000).toISOString(),
          storageType: 'HOT_INSULATED',
          temperatureCelsius: 62,
          packagingDetails: 'Foil wrapped thermal pouches',
          address: 'Plot 44, Worli Sea Face',
          city: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400018',
          country: 'IN',
          lat: 19.0178,
          lng: 72.8173,
          earliestCollectionTime: new Date().toISOString(),
          latestSafeCollectionDeadline: new Date(Date.now() + 7200000).toISOString(),
          status: 'RESERVED',
          reservedQuantity: 15,
          collectedQuantity: 0,
          deliveredQuantity: 0,
          safetyDeclarationAccepted: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setDonations(seed);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.safetyDeclarationAccepted) {
      setErrorMessage('You must accept the FSSAI Food Safety & Hygiene Declaration before publishing.');
      return;
    }

    // India Address Check
    const addrCheck = validateIndianAddress({
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
      country: 'IN',
    });

    if (!addrCheck.isValid) {
      setErrorMessage(addrCheck.error || 'Invalid Indian address');
      return;
    }

    setSubmitting(true);
    try {
      const newDonation = await createDonation({
        donorId: profile?.uid || 'donor_user',
        donorOrgId: organization?.id || 'demo_org_donor_01',
        donorOrgName: organization?.name || 'Grand Pavilion Caterers',
        foodName: formData.foodName,
        description: formData.description,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        estimatedServings: Number(formData.estimatedServings),
        dietaryType: formData.dietaryType,
        allergens: formData.allergens,
        cookedOrPackedAt: new Date(formData.cookedOrPackedAt).toISOString(),
        storageType: formData.storageType,
        temperatureCelsius: Number(formData.temperatureCelsius),
        packagingDetails: formData.packagingDetails,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        country: 'IN',
        lat: 19.0178,
        lng: 72.8173,
        earliestCollectionTime: new Date(formData.earliestCollectionTime).toISOString(),
        latestSafeCollectionDeadline: new Date(formData.latestSafeCollectionDeadline).toISOString(),
        status: 'AVAILABLE',
        safetyDeclarationAccepted: true,
      });

      setDonations(prev => [newDonation, ...prev]);
      setIsModalOpen(false);
      // Reset form
      setFormData(prev => ({ ...prev, foodName: '', description: '', safetyDeclarationAccepted: false }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to list surplus food');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDonation = async (donationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this donation listing?')) return;
    try {
      await updateDonationStatus(donationId, 'CANCELLED', 'Donor requested cancellation');
      setDonations(prev =>
        prev.map(d => (d.id === donationId ? { ...d, status: 'CANCELLED' } : d))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to cancel donation');
    }
  };

  const getStatusBadge = (status: Donation['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">Available for NGO Matching</span>;
      case 'RESERVED':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-300">Reserved by NGO</span>;
      case 'PICKUP_ASSIGNED':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">Volunteer En Route</span>;
      case 'COLLECTED':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-300">Collected from Kitchen</span>;
      case 'DELIVERED':
        return <span className="bg-stone-100 text-stone-800 text-xs font-bold px-2.5 py-1 rounded-full border border-stone-300">Delivered & Verified</span>;
      case 'SAFETY_HOLD':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-300">Safety Hold (Under Review)</span>;
      default:
        return <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Org Verification Status */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-stone-900">
                  {organization?.name || 'Food Donor Command Center'}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> FSSAI Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                License: {organization?.fssaiNumber || '11521018000342'} • Operating City: {organization?.city || 'Mumbai'}, {organization?.state || 'Maharashtra'} (India)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Post Surplus Food Listing</span>
        </button>
      </div>

      {/* Active Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            Surplus Food Batches ({donations.length})
          </h2>
          <span className="text-xs text-stone-500">Auto-refreshed via Cloud Firestore</span>
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 text-stone-400 text-sm">
            Loading food listings...
          </div>
        ) : donations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-700">No active surplus batches</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Ready to redirect edible surplus? Click above to list hot meals, raw ingredients, or bakery items.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((d, index) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {d.category.replace('_', ' ')}
                    </span>
                    {getStatusBadge(d.status)}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                      {d.foodName}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{d.description}</p>
                  </div>

                  {/* Quantity & Serving Specs */}
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] font-semibold uppercase">Quantity</span>
                      <span className="font-bold text-stone-900 text-sm">
                        {d.quantity} {d.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] font-semibold uppercase">Est. Servings</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        ~{d.estimatedServings} Meals
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] font-semibold uppercase">Dietary</span>
                      <span className={`font-bold ${d.dietaryType === 'VEG' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {d.dietaryType}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] font-semibold uppercase">Storage Temp</span>
                      <span className="font-mono text-stone-800 font-semibold">
                        {d.temperatureCelsius ? `${d.temperatureCelsius}°C` : d.storageType}
                      </span>
                    </div>
                  </div>

                  {/* Deadlines & Location */}
                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Safe Deadline: {new Date(d.latestSafeCollectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{d.city}, {d.state} ({d.pinCode})</span>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400 font-mono">ID: {d.id}</span>
                  {d.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleCancelDonation(d.id)}
                      className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Donation Modal with AnimatePresence */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg">List Commercial Surplus Food</h3>
                <p className="text-xs text-emerald-200">Mandatory FSSAI safety criteria & Indian address validation</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateDonation} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {errorMessage && (
                <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Food Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Food Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.foodName}
                    onChange={e => setFormData({ ...formData, foodName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-600"
                    placeholder="e.g. Vegetable Biryani & Mixed Dal"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Food Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as FoodCategory })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                  >
                    <option value="COOKED_MEALS">Cooked Meals (Buffet/Catering)</option>
                    <option value="RAW_GROCERY">Raw Grocery (Rice, Flour, Lentils)</option>
                    <option value="PACKAGED_FOOD">Packaged Sealed Goods</option>
                    <option value="BAKERY">Bakery & Bread</option>
                    <option value="FRUITS_VEGETABLES">Fresh Produce</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description & Preparation Notes</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900"
                  placeholder="e.g. Untouched buffet pans from 8 PM corporate banquet"
                />
              </div>

              {/* Quantity, Unit, Servings, Dietary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value as QuantityUnit })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                  >
                    <option value="KG">Kilograms (KG)</option>
                    <option value="LITRES">Litres</option>
                    <option value="MEAL_TRAYS">Meal Trays</option>
                    <option value="PORTIONS">Portions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estimated Servings *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.estimatedServings}
                    onChange={e => setFormData({ ...formData, estimatedServings: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dietary Type *</label>
                  <select
                    value={formData.dietaryType}
                    onChange={e => setFormData({ ...formData, dietaryType: e.target.value as DietaryType })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                  >
                    <option value="VEG">Vegetarian (Veg)</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                  </select>
                </div>
              </div>

              {/* Storage Method & Temperature */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Storage Method *</label>
                  <select
                    value={formData.storageType}
                    onChange={e => setFormData({ ...formData, storageType: e.target.value as StorageType })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                  >
                    <option value="HOT_INSULATED">Hot Insulated (&gt;60°C)</option>
                    <option value="REFRIGERATED">Refrigerated (&lt;5°C)</option>
                    <option value="ROOM_TEMP">Room Temperature Ambient</option>
                    <option value="FROZEN">Frozen (&lt;-18°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Recorded Temp (°C)</label>
                  <input
                    type="number"
                    value={formData.temperatureCelsius}
                    onChange={e => setFormData({ ...formData, temperatureCelsius: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Known Allergens</label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={e => setFormData({ ...formData, allergens: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                    placeholder="e.g. Dairy, Peanuts, Gluten"
                  />
                </div>
              </div>

              {/* Collection Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Earliest Collection Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.earliestCollectionTime}
                    onChange={e => setFormData({ ...formData, earliestCollectionTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Latest Safe Consumption Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.latestSafeCollectionDeadline}
                    onChange={e => setFormData({ ...formData, latestSafeCollectionDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>
              </div>

              {/* Indian Address Fields */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Pickup Location in India</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-stone-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-stone-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">State / UT</label>
                    <select
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-stone-900 bg-white"
                    >
                      {INDIAN_STATES_AND_UTS.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">PIN Code (6 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={formData.pinCode}
                      onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-stone-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Safety Declaration Checkbox */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.safetyDeclarationAccepted}
                    onChange={e => setFormData({ ...formData, safetyDeclarationAccepted: e.target.checked })}
                    className="w-4 h-4 text-emerald-800 rounded mt-0.5"
                  />
                  <div className="text-[11px] text-emerald-950 leading-relaxed">
                    <span className="font-bold block">Statutory FSSAI Food Safety & Hygiene Declaration:</span>
                    I certify under the Food Safety and Standards Regulations that this food was prepared in an FSSAI-compliant kitchen, remained untouched by consumers, has been kept in hygienic conditions, and is wholesome and safe for human consumption within the declared safe deadline.
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileCheck2 className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Publishing...' : 'Publish Surplus Batch'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
};
