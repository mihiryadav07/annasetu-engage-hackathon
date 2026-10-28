/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  UserCheck,
  Shield,
  Truck,
  HeartHandshake,
  UtensilsCrossed,
  CheckCircle2,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTestSuite: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenTestSuite,
}) => {
  const { profile, user, signIn, signOut, switchDemoRole, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'DONOR', label: 'Food Donor Portal', icon: UtensilsCrossed, color: 'text-emerald-700 bg-emerald-50' },
    { role: 'RECIPIENT', label: 'NGO / Kitchen Portal', icon: HeartHandshake, color: 'text-blue-700 bg-blue-50' },
    { role: 'VOLUNTEER', label: 'Volunteer Logistics', icon: Truck, color: 'text-amber-700 bg-amber-50' },
    { role: 'ADMIN', label: 'Admin & Oversight', icon: Shield, color: 'text-purple-700 bg-purple-50' },
  ];

  const handleRoleChange = async (role: UserRole) => {
    await switchDemoRole(role);
    setRoleDropdownOpen(false);
    // Switch to respective portal tab
    if (role === 'DONOR') onSelectTab('donor');
    else if (role === 'RECIPIENT') onSelectTab('recipient');
    else if (role === 'VOLUNTEER') onSelectTab('volunteer');
    else if (role === 'ADMIN') onSelectTab('admin');
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'food-safety', label: 'Food Safety' },
    { id: 'donor', label: 'Donor Portal' },
    { id: 'recipient', label: 'NGO Portal' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Banner: India Mission & Persona Switcher */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">
            National Food Redistribution Infrastructure — <span className="text-amber-300 font-semibold">India Operations Only</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Persona Switcher for test evaluation */}
          <span className="text-stone-300 hidden sm:inline text-[11px]">Role Persona:</span>
          <div className="inline-flex rounded-lg bg-emerald-900/80 p-0.5 border border-emerald-700/60">
            {(['DONOR', 'RECIPIENT', 'VOLUNTEER', 'ADMIN'] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                  profile?.role === r
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              const { seedDemonstrativeDataToFirestore } = await import('../../services/seedData');
              const res = await seedDemonstrativeDataToFirestore();
              alert(`Successfully synchronized ${res.count} demonstrative records (2 per usecase) across Organizations, Surplus Donations, Volunteers, Reservations, Pickups, and Audit Logs!`);
              window.location.reload();
            }}
            className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md transition shadow cursor-pointer border border-emerald-600 ml-1"
            title="Populate 2 demonstrative real datasets for every usecase into Firestore"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load 2 Real Datasets / Use Case</span>
          </button>

          <button
            onClick={onOpenTestSuite}
            className="flex items-center gap-1 bg-amber-600/90 hover:bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md transition shadow cursor-pointer ml-1"
            title="Run complete automated test verification suite"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Test Suite</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => onSelectTab('home')}
          className="text-left cursor-pointer focus:outline-none"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-stone-600">
          {navLinks.map(link => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`relative px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  isActive
                    ? 'text-emerald-950 font-bold'
                    : 'hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-emerald-50 border border-emerald-200 rounded-xl -z-10 shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Notifications & Profile / Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />

          {/* Current Persona Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-200">
            <div className="text-right">
              <p className="text-xs font-bold text-stone-900 truncate max-w-[130px]">
                {profile?.displayName || 'Guest User'}
              </p>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-300">
                {profile?.role || 'DONOR'}
              </span>
            </div>

            {user ? (
              <button
                onClick={signOut}
                title="Sign Out"
                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden md:inline">Google Sign-In</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-5 space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-stone-100">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-medium ${
                    currentTab === link.id
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Persona selector for mobile */}
            <div className="pt-2">
              <p className="text-xs text-stone-500 mb-1.5 font-medium">Switch Active Role Persona:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      handleRoleChange(r.role);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${
                      profile?.role === r.role
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <r.icon className="w-3.5 h-3.5" />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
