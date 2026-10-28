/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { TestSuiteModal } from './components/common/TestSuiteModal';
import { HomeView } from './components/public/HomeView';
import { HowItWorksView } from './components/public/HowItWorksView';
import { FoodSafetyView } from './components/public/FoodSafetyView';
import { AboutView, ContactView, PrivacyTermsView } from './components/public/AboutContactViews';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { RecipientDashboard } from './components/recipient/RecipientDashboard';
import { VolunteerDashboard } from './components/volunteer/VolunteerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

import { AnimatePresence, motion } from 'motion/react';

function MainApp() {
  const { profile } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView onSelectTab={setCurrentTab} />;
      case 'how-it-works':
        return <HowItWorksView onSelectTab={setCurrentTab} />;
      case 'food-safety':
        return <FoodSafetyView />;
      case 'donor':
        return <DonorDashboard />;
      case 'recipient':
        return <RecipientDashboard />;
      case 'volunteer':
        return <VolunteerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'privacy':
        return <PrivacyTermsView type="privacy" />;
      case 'terms':
        return <PrivacyTermsView type="terms" />;
      default:
        return <HomeView onSelectTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenTestSuite={() => setIsTestModalOpen(true)}
      />

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onSelectTab={setCurrentTab} />

      {/* Verification Audit & Test Suite Modal */}
      <TestSuiteModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
