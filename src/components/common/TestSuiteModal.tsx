/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { runAutomatedVerificationSuite, type TestSuiteSummary } from '../../tests/automatedTests';

import { AnimatePresence, motion } from 'motion/react';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({ isOpen, onClose }) => {
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(() => runAutomatedVerificationSuite());
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = runAutomatedVerificationSuite();
      setTestSummary(summary);
      setIsRunning(false);
    }, 250);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-lg">AnnaSetu Engineering Audit & Test Verification</h3>
              <p className="text-xs text-emerald-200">
                Live automated test execution for Security, Indian Geo-Bounds, FSSAI Safety, and Integrity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Metric Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Passed: {testSummary?.passed} / {testSummary?.total}
            </span>
            {testSummary && testSummary.failed > 0 && (
              <span className="flex items-center gap-1.5 text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                <XCircle className="w-4 h-4" /> Failed: {testSummary.failed}
              </span>
            )}
            <span className="text-stone-500 font-mono">Duration: {testSummary?.durationMs}ms</span>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executing Tests...' : 'Rerun Complete Audit Suite'}
          </button>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-stone-100">
          {testSummary?.results.map(test => (
            <div key={test.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-300">
                    {test.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {test.category}
                  </span>
                  <h4 className="text-sm font-semibold text-stone-900">{test.name}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                  <div>
                    <span className="font-semibold text-stone-500">Expected:</span>{' '}
                    <span className="font-mono text-stone-700">{test.expected}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-500">Actual Result:</span>{' '}
                    <span className="font-mono text-stone-800">{test.actual}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
                {test.passed ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASSED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                    <XCircle className="w-3.5 h-3.5 text-red-600" /> FAILED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="bg-stone-100 border-t border-stone-200 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Close Audit View
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
