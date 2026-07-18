'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [weightUnit, setWeightUnit] = useState('metric');
  const [dataSharing, setDataSharing] = useState(false);
  const [offlineCache, setOfflineCache] = useState(true);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-3xl text-white tracking-tight">⚙️ Settings</h1>
        <p className="text-slate-400 text-xs mt-1">Configure your companion parameters and read legal disclaimers.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile config links */}
        <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
          <h2 className="font-display font-extrabold text-base text-white">👤 Health Profile Management</h2>
          <p className="text-slate-400 text-xs leading-normal">
            Your profile setup calibrates all ingredient and clinical warning thresholds. Update your health parameters at any time:
          </p>
          <div className="flex gap-3">
            <Link 
              href="/profile/setup" 
              className="px-4 py-2.5 bg-slate-900 border border-white/5 hover:border-emerald-500/20 text-xs font-bold text-slate-300 rounded-xl transition-all"
            >
              🔄 Relaunch Onboarding Setup
            </Link>
            <Link 
              href="/family" 
              className="px-4 py-2.5 bg-slate-900 border border-white/5 hover:border-emerald-500/20 text-xs font-bold text-slate-300 rounded-xl transition-all"
            >
              👪 Edit Family Profiles
            </Link>
          </div>
        </div>

        {/* Configurations settings */}
        <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
          <h2 className="font-display font-extrabold text-base text-white">⚙️ App Configurations</h2>
          
          <div className="flex items-center justify-between py-2 border-b border-white/5 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-white text-xs">Measurement Units</span>
              <span className="text-[10px] text-slate-500">Weight metrics displayed in grams and kilograms.</span>
            </div>
            <select
              value={weightUnit}
              onChange={e => setWeightUnit(e.target.value)}
              className="bg-slate-950 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="metric">Metric (g / kg)</option>
              <option value="imperial">Imperial (oz / lb)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-white text-xs">Offline Cache</span>
              <span className="text-[10px] text-slate-500">Enable local database cache for sub-50ms scans.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={offlineCache} 
                onChange={e => setOfflineCache(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0"
              />
            </label>
          </div>

          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-white text-xs">Anonymized Data Sharing</span>
              <span className="text-[10px] text-slate-500">Share anonymized scan categories to help improve FSSAI transparency.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={dataSharing} 
                onChange={e => setDataSharing(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="glass-card rounded-2xl border border-red-500/10 bg-red-500/5 p-5 flex flex-col gap-3">
          <h2 className="font-display font-extrabold text-sm text-red-400">⚠️ Legal & Medical Disclaimer</h2>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            ARHA-FoodLens is a consumer health information companion designed to identify food additives and verify public nutrition labels. It is not a medical device and does not provide formal clinical diagnoses.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            All dietary guidelines and food warnings represent statistical correlations and scientific literature (IARC, EFSA, WHO). Consult with a certified clinical practitioner or diabetologist before making significant adjustments to your diabetes or cardiovascular medication regimes.
          </p>
        </div>
      </div>
    </div>
  );
}
