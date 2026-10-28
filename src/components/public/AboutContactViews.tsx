/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Send, AlertTriangle, FileText } from 'lucide-react';
import { reportSafetyIncident } from '../../services/incidentService';
import { useAuth } from '../../context/AuthContext';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          About AnnaSetu
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-sans">
          Tagline: <span className="font-serif italic font-bold text-emerald-800">“Every Meal Finds Its Way.”</span>
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
        <h2 className="font-serif font-bold text-xl text-stone-900">The Problem & The Bridge</h2>
        <p>
          In India, millions of kilograms of perfectly wholesome food are lost or wasted daily across banquets, luxury hotels, corporate canteens, and restaurant chains—often within just a few kilometers of shelter homes, orphanages, and community kitchens facing acute daily nourishment deficits.
        </p>
        <p>
          Commercial food businesses frequently hesitate to donate surplus meals due to logistics coordination burdens, lack of verified NGO credentials, and food safety liability ambiguities. At the same time, NGOs lack real-time visibility into who has eligible surplus food nearby.
        </p>
        <p>
          <strong className="text-stone-900">AnnaSetu (अन्न सेतु)</strong> serves as India’s dedicated digital bridge. It combines FSSAI food-safety governance, automated matching with strict dietary filters, and verifiable volunteer logistics so that nutritious surplus food reaches accredited beneficiaries before the safe consumption deadline passes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <h3 className="font-bold text-emerald-950 text-sm mb-1">Zero Hunger (SDG 2)</h3>
            <p className="text-xs text-emerald-800">
              Redistributing surplus calories directly to children’s shelters, elderly homes, and labor settlements.
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <h3 className="font-bold text-amber-950 text-sm mb-1">Responsible Recovery (SDG 12)</h3>
            <p className="text-xs text-amber-800">
              Preventing organic landfill emissions and methane release by salvaging edible commercial surplus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.displayName || '',
    email: profile?.email || '',
    subject: '',
    message: '',
    incidentDonationId: '',
    isSafetyIncident: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (form.isSafetyIncident && form.incidentDonationId) {
        await reportSafetyIncident({
          donationId: form.incidentDonationId,
          reporterId: profile?.uid || 'anonymous',
          reporterEmail: form.email,
          reason: form.subject || 'Safety Report via Contact Form',
          description: form.message,
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Contact & Incident Support
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Need assistance or wish to report a food quality concern? Our national operations response desk operates 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-900 text-white p-6 rounded-3xl border border-stone-800 space-y-6">
          <h2 className="font-bold text-base text-stone-100">National Helplines</h2>
          <div className="space-y-4 text-xs text-stone-300">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Toll-Free Helpline</p>
                <p className="text-stone-400">1800-266-2738 (1800-ANNA-SETU)</p>
                <p className="text-[10px] text-stone-500">Available 07:00 - 23:00 IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Support Email</p>
                <p className="text-stone-400">helpdesk@annasetu.org.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Operating Jurisdiction</p>
                <p className="text-stone-400">Republic of India (All 28 States & 8 UTs)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">Message & Report Received</h3>
              <p className="text-xs text-stone-600">
                Our operations team has received your ticket and will follow up promptly. If you reported a safety hold on a donation, the listing has been placed on hold automatically.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-emerald-800 hover:underline pt-2 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="name@organization.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Inquiry or issue topic"
                />
              </div>

              {/* Emergency Safety Incident Flag */}
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isSafetyIncident}
                    onChange={e => setForm({ ...form, isSafetyIncident: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    Flag this as an Urgent Food Safety Incident
                  </span>
                </label>
                {form.isSafetyIncident && (
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Donation ID (Optional or relevant batch ID)
                    </label>
                    <input
                      type="text"
                      value={form.incidentDonationId}
                      onChange={e => setForm({ ...form, incidentDonationId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs text-stone-900"
                      placeholder="e.g. don_xyz123"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Describe your inquiry or observation..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Message to AnnaSetu Support'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const PrivacyTermsView: React.FC<{ type?: 'privacy' | 'terms' }> = ({ type = 'privacy' }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs text-stone-700 leading-relaxed">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-200">
          <FileText className="w-6 h-6 text-emerald-800" />
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            {type === 'terms' ? 'Terms of Service & Food Safety Liability' : 'Privacy Policy & PII Protection'}
          </h1>
        </div>

        <section className="space-y-2">
          <h3 className="font-bold text-stone-900 text-sm">1. National Operations & Territorial Restriction</h3>
          <p>
            AnnaSetu operates solely within the sovereign territory of the Republic of India. All participating food donors, beneficiary organizations, and volunteer couriers must be located within India. Any transactions attempting to route food outside India are automatically rejected by our address integrity validation mechanisms.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-stone-900 text-sm">2. Food Safety & Good Samaritan Liability Relief</h3>
          <p>
            In accordance with the Food Safety and Standards (Recovery & Distribution of Surplus Food) Regulations, 2019, commercial food donors acting in good faith without negligence are protected against liability, provided that:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The food was prepared under hygienic conditions conforming to Schedule 4 of FSS (Licensing and Registration of Food Businesses) Regulations, 2011.</li>
            <li>The food remained within safe temperature parameters prior to collection.</li>
            <li>No known spoilage, rancidity, or contamination occurred.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-stone-900 text-sm">3. Personally Identifiable Information (PII) Protection</h3>
          <p>
            Under the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, AnnaSetu encrypts and isolates user telephone numbers, exact GPS location streams, and administrative documents. Volunteer location histories are retained only for the duration of the pickup milestone and never sold to commercial marketing brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-stone-900 text-sm">4. Tamper-Evident Delivery & OTP Handover</h3>
          <p>
            The physical transfer of surplus food is authenticated using single-use 6-digit confirmation codes provided by the recipient organization. Deliveries cannot be marked complete without explicit verification of this handover code.
          </p>
        </section>
      </div>
    </div>
  );
};
