/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Heart, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC<{ onSelectTab: (tab: string) => void }> = ({ onSelectTab }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="text-white">
              <Logo size="md" />
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              AnnaSetu is India’s verifiable surplus food redistribution infrastructure connecting commercial food donors with accredited community kitchens and NGOs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-stone-950 p-2.5 rounded-xl border border-stone-800">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Compliant with FSSAI Surplus Food Recovery Directives (India)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onSelectTab('donor')} className="hover:text-amber-400 transition cursor-pointer">
                  For Commercial Food Donors
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('recipient')} className="hover:text-amber-400 transition cursor-pointer">
                  For Verified NGOs & Shelters
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('volunteer')} className="hover:text-amber-400 transition cursor-pointer">
                  Volunteer Logistics & Handover
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('food-safety')} className="hover:text-amber-400 transition cursor-pointer">
                  FSSAI Food Safety Protocols
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('admin')} className="hover:text-amber-400 transition cursor-pointer">
                  Administrative Review & Oversight
                </button>
              </li>
            </ul>
          </div>

          {/* Operational Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-3">
              Indian Operational Standards
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>• 14-Digit FSSAI License Validation</li>
              <li>• NGO Darpan & 12A/80G Verification</li>
              <li>• 4-Hour Cooked Food Window Enforcement</li>
              <li>• 6-Digit Single-Use Handover Verification</li>
              <li>• All destinations bounded to India (IN)</li>
              <li>• Immutable Audit Event Trails</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-3">
              Emergency & Support
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>National Helpline: 1800-ANNA-SETU</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>operations@annasetu.org.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Pan-India Redirection Network</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-800">
                To report unsafe food immediately, use the Emergency Safety Hold action in the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© 2026 AnnaSetu Platform. Tagline: “Every Meal Finds Its Way.” All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => onSelectTab('privacy')} className="hover:text-stone-300 cursor-pointer">
              Privacy & PII Protection
            </button>
            <span>•</span>
            <button onClick={() => onSelectTab('terms')} className="hover:text-stone-300 cursor-pointer">
              Terms & Safety Liability
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
