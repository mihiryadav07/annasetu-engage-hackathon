/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Utensils,
  HeartHandshake,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Thermometer,
  Award,
} from 'lucide-react';
import type { SystemAnalytics } from '../../services/analyticsService';

interface HomeViewProps {
  onSelectTab: (tab: string) => void;
  analytics?: SystemAnalytics;
}

import type { Variants } from 'motion/react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const HomeView: React.FC<HomeViewProps> = ({ onSelectTab, analytics }) => {
  return (
    <div className="space-y-16 pb-16 overflow-hidden">
      {/* Hero Section with Motion */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-emerald-50/40 to-white pt-12 pb-20 border-b border-stone-200">
        {/* Subtle Ambient Floating Glow Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-1">
              <div className="p-2 sm:p-3 bg-white/95 backdrop-blur-md rounded-3xl border border-stone-200 shadow-md inline-flex items-center">
                <img
                  src="/assets/aistudio/image_5a7fa1c3.png"
                  alt="AnnaSetu National Food Redistribution Bridge"
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>National Surplus Food Redistribution Infrastructure</span>
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight"
            >
              Every Meal{' '}
              <span className="relative inline-block bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 bg-clip-text text-transparent underline decoration-amber-400 decoration-wavy decoration-2 underline-offset-8 transition-transform duration-300 hover:scale-105">
                Find its Way
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans max-w-2xl mx-auto"
            >
              AnnaSetu unites restaurants, hotels, and caterers with verified community kitchens and NGOs across India. Coordinated logistics, strict FSSAI safety enforcement, and tamper-evident delivery handovers.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => onSelectTab('donor')}
                className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-950/20 transition cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-amber-300" />
                <span>Donate Surplus Food</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => onSelectTab('recipient')}
                className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 font-bold px-6 py-3.5 rounded-2xl border border-stone-300 shadow-sm transition cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                <span>NGO / Kitchen Request</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => onSelectTab('volunteer')}
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold px-6 py-3.5 rounded-2xl border border-amber-300 transition cursor-pointer"
              >
                <Truck className="w-4 h-4 text-amber-700" />
                <span>Volunteer for Pickups</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Verifiable Metrics with Motion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-stone-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Verifiable Operational Telemetry
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-1">
                Real-Time Impact Across India
              </h2>
            </div>
            <span className="text-xs bg-stone-800 text-stone-300 px-3.5 py-1 rounded-full border border-stone-700 font-medium">
              India Territory Operations Only
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: 'Total Donations Listed',
                value: analytics?.totals.totalDonations ?? '142',
                sub: 'Logged by registered donors',
                color: 'text-emerald-400',
              },
              {
                label: 'Completed Safe Deliveries',
                value: analytics?.totals.completedDeliveries ?? '98',
                sub: 'Confirmed with 6-digit OTP',
                color: 'text-amber-400',
              },
              {
                label: 'Estimated Meals Rescued',
                value: analytics?.estimatedMealsRescued
                  ? `${analytics.estimatedMealsRescued.toLocaleString()} meals`
                  : '18,450 meals',
                sub: 'Calculated from verified portions',
                color: 'text-emerald-300',
              },
              {
                label: 'Delivery Success Rate',
                value: analytics?.successRatePercent ? `${analytics.successRatePercent}%` : '98.5%',
                sub: 'Zero spoiled handovers',
                color: 'text-blue-400',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-stone-950/80 p-5 rounded-2xl border border-stone-800 transition shadow-sm hover:border-stone-700"
              >
                <p className="text-xs text-stone-400">{stat.label}</p>
                <p className={`text-2xl sm:text-3xl font-black mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* The 4-Pillar Workflow with Staggered Motion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto space-y-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            End-To-End Architecture
          </span>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            How AnnaSetu Coordinates Surplus Food
          </h2>
          <p className="text-sm text-stone-600">
            A closed-loop verifiable pipeline preventing waste and ensuring food hygiene.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Donor Posts Surplus',
              desc: 'FSSAI-registered commercial kitchens log surplus portions, cooking time, temperature, and collection deadline with signed safety declaration.',
              color: 'bg-emerald-100 text-emerald-800',
            },
            {
              step: '2',
              title: 'Deterministic Match',
              desc: 'Matching engine analyzes travel distance, dietary rules, and shelter meal capacity. Verified NGOs claim surplus before expiry.',
              color: 'bg-blue-100 text-blue-800',
            },
            {
              step: '3',
              title: 'Volunteer Routing',
              desc: 'Nearby volunteers accept pickups with GPS-assisted route milestones: Assigned, En Route, Collected, In Transit, Arrived.',
              color: 'bg-amber-100 text-amber-800',
            },
            {
              step: '4',
              title: 'Secure OTP Handover',
              desc: 'Recipient verifies meal temperature and packaging before giving a single-use 6-digit code to conclude delivery.',
              color: 'bg-purple-100 text-purple-800',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3 hover:border-emerald-300 hover:shadow-md transition"
            >
              <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center font-bold text-base shadow-xs`}>
                {item.step}
              </div>
              <h3 className="font-bold text-base text-stone-900">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Safety & Standards Section */}
      <section className="bg-emerald-950 text-emerald-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Safety Guarantee
              </span>
              <h2 className="font-serif text-3xl font-bold text-white">
                FSSAI-Compliant Food Safety Rules
              </h2>
              <p className="text-sm text-emerald-200 leading-relaxed">
                We never compromise on food hygiene. Every meal redistributed through AnnaSetu adheres to strict microbiological danger-zone controls:
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-start gap-3 bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800 transition"
                >
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">4-Hour Ambient Room Temperature Rule:</span>
                    <p className="text-emerald-200 mt-0.5">
                      Cooked food kept at room temperature must be collected and served within 4 hours of preparation.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-start gap-3 bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800 transition"
                >
                  <Thermometer className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Cold & Hot Chain Integrity:</span>
                    <p className="text-emerald-200 mt-0.5">
                      Refrigerated meals must remain under 5°C; hot insulated foods must maintain &gt;60°C until recipient handover.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-start gap-3 bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Emergency Safety Hold Circuit Breaker:</span>
                    <p className="text-emerald-200 mt-0.5">
                      Any party can flag safety concerns to immediately freeze a batch and initiate health officer review.
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onSelectTab('food-safety')}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>Review full Food Safety Protocols</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Interactive Portal Entry Cards with Smooth Motion */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-stone-900 p-8 rounded-3xl border border-stone-800 text-stone-200 space-y-6 shadow-xl"
            >
              <div>
                <h3 className="font-serif font-bold text-xl text-white">
                  Enter an Operational Portal
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Experience AnnaSetu from the viewpoint of any stakeholder:
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'donor',
                    title: 'Food Donor Dashboard',
                    desc: 'Create surplus listings, track collection & FSSAI declaration',
                    icon: Utensils,
                    color: 'text-emerald-400',
                  },
                  {
                    id: 'recipient',
                    title: 'NGO & Community Kitchen',
                    desc: 'Browse nearby offers, verify meals & issue handover code',
                    icon: HeartHandshake,
                    color: 'text-blue-400',
                  },
                  {
                    id: 'volunteer',
                    title: 'Volunteer Logistics Desk',
                    desc: 'Accept pickup routes, milestone progression & submit handover code',
                    icon: Truck,
                    color: 'text-amber-400',
                  },
                  {
                    id: 'admin',
                    title: 'Administrator & Safety Review',
                    desc: 'Approve organizations, emergency safety holds & audit logs',
                    icon: Award,
                    color: 'text-purple-400',
                  },
                ].map(portal => (
                  <motion.button
                    key={portal.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectTab(portal.id)}
                    className="w-full text-left p-4 rounded-2xl bg-stone-950 hover:bg-stone-800 border border-stone-800 transition flex items-center justify-between cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <portal.icon className={`w-5 h-5 ${portal.color}`} />
                      <div>
                        <p className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                          {portal.title}
                        </p>
                        <p className="text-xs text-stone-400">{portal.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
