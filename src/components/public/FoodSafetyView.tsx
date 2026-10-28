/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  ThermometerSnowflake,
  Flame,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Building,
} from 'lucide-react';

export const FoodSafetyView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
          <span>FSSAI Surplus Food Regulations (2019 / Amended)</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          AnnaSetu Food Safety & Hygiene Standards
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Surplus food redistribution requires uncompromising safety standards. AnnaSetu enforces scientific handling, temperature discipline, and verified handover to protect vulnerable communities across India.
        </p>
      </div>

      {/* Temperature Danger Zone Visual */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Microbiological Danger Zone
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-1">
            Temperature Thresholds for Food Redistribution
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Bacterial reproduction accelerates between 5°C and 60°C. Food must be kept outside this zone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-950 p-5 rounded-2xl border border-blue-900/40 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <ThermometerSnowflake className="w-5 h-5" />
              <h3 className="font-bold text-sm">Cold Chain Integrity (&lt; 5°C)</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Cooked meals meant for delayed consumption, milk, dairy products, and cut salads must be maintained below 5°C throughout transit in pre-chilled coolers.
            </p>
            <div className="text-[11px] font-mono text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/40">
              Target: 0°C to 4°C
            </div>
          </div>

          <div className="bg-stone-950 p-5 rounded-2xl border border-red-900/40 space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Danger Zone (5°C to 60°C)</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Room temperature cooked food is restricted to a maximum window of 4 hours from cooking completion to delivery and consumption.
            </p>
            <div className="text-[11px] font-mono text-red-300 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-800/40">
              Strict Max: 4 Hours Ambient
            </div>
          </div>

          <div className="bg-stone-950 p-5 rounded-2xl border border-amber-900/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="w-5 h-5" />
              <h3 className="font-bold text-sm">Hot Insulated (&gt; 60°C)</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Hot buffet surpluses, curries, lentils, and gravies must be packed in food-grade thermal insulated containers and kept above 60°C.
            </p>
            <div className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40">
              Target: 65°C to 75°C
            </div>
          </div>
        </div>
      </div>

      {/* Donor Checklist & Obligations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-stone-900">Commercial Donor Responsibilities</h3>
          </div>
          <ul className="space-y-3 text-xs text-stone-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Must hold an active 14-digit FSSAI food business operator registration/license.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Surplus food must have remained untouched by customers in clean serving trays.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Accurate declaration of preparation timestamp and known allergens (peanuts, milk, gluten, shellfish).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>No expired, rancid, swollen can, or microbiologically compromised food may be offered.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-stone-900">NGO & Kitchen Obligations</h3>
          </div>
          <ul className="space-y-3 text-xs text-stone-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Physical inspection of meal odor, texture, and container seals before distribution.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Release the 6-digit confirmation code ONLY after verifying safe handover condition.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Prompt consumption: Distribute meals immediately upon receipt to shelter residents.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Immediately report suspicious odors or packaging damage through the Emergency Safety Hold.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
