/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  UtensilsCrossed,
  Filter,
  CheckCircle,
  Truck,
  KeyRound,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksView: React.FC<{ onSelectTab: (tab: string) => void }> = ({ onSelectTab }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Step-by-Step Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          How AnnaSetu Works Across India
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Connecting surplus food with those who need it through a verifiable chain of custody, deterministic matching, and secure delivery confirmation.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl flex-shrink-0">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Step 1</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500 font-medium">Food Donor</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">Surplus Listing & FSSAI Safety Declaration</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Restaurants, caterers, and hotels input surplus details: quantity (in KG, Litres, or Portions), vegetarian or non-vegetarian status, preparation timestamp, temperature conditions, packaging details, and earliest / latest safe collection windows. The donor must accept the statutory Food Safety & Hygiene Declaration before publishing.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl flex-shrink-0">
            <Filter className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-blue-700 tracking-wider">Step 2</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500 font-medium">Deterministic Match</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">Eligibility Constraint Evaluation & Ranking</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our matching algorithm applies strict hard constraints first: verified organization status, dietary policy compatibility (never offering meat to pure-vegetarian shelters), distance limits (&lt;40km for cooked meals), and available quantity. The remaining offers are ranked deterministically by travel proximity, time urgency, and shelter capacity.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl flex-shrink-0">
            <Truck className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-amber-700 tracking-wider">Step 3</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500 font-medium">Volunteer Logistics</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">Coordinated Milestone Progression</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Registered volunteers browse open routes on their dashboard, view pickup/dropoff addresses in India, and accept assignments. As the volunteer travels, they record immutable milestone events (Assigned, En Route, Arrived at Donor, Collected, En Route to Recipient, Arrived at Recipient).
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl flex-shrink-0">
            <KeyRound className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-purple-700 tracking-wider">Step 4</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500 font-medium">Handover Verification</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">Expiring 6-Digit Code Authentication</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              To prevent misplacement or fraudulent claims, the recipient NGO holds a secure single-use 6-digit confirmation code. Only when the food has physically arrived, containers inspected, and portions verified does the recipient provide this code to the volunteer, finalizing the delivery in Firestore.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onSelectTab('donor')}
          className="inline-flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md transition cursor-pointer"
        >
          <span>Get Started on AnnaSetu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
