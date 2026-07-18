'use client';

import { useState } from 'react';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<'official' | 'personal'>('official');

  const officialRecalls = [
    {
      id: "alert-1",
      title: "FSSAI Spices Contamination Recall Notice",
      brand: "MDH & Everest Spices",
      alert_type: "recall",
      description: "FSSAI ordered nationwide check on MDH and Everest powdered mixes after Hong Kong and Singapore suspended sales due to presence of Ethylene Oxide pesticide beyond clinical safe limits.",
      fssai_reference: "Order No. 12(3)2024/Recall",
      issued_date: "2024-05-15",
      source_url: "https://fssai.gov.in"
    },
    {
      id: "alert-2",
      title: "Commercial Bread Potassium Bromate Warning",
      brand: "Local Bakery and Bread Brands",
      alert_type: "warning",
      description: "Potassium Bromate (additive E924) remains restricted but partially legal in Indian sliced breads, despite being linked to thyroid tumor acceleration and kidney genotoxicity. Look for 'No Bromate' tags on packing labels.",
      fssai_reference: "Advisory/Bread/2023",
      issued_date: "2023-11-04",
      source_url: "https://fssai.gov.in"
    }
  ];

  const personalAlerts = [
    {
      id: "personal-1",
      title: "Sugar limit threshold warning",
      description: "You have consumed 24g of sugar today, reaching 96% of your daily diabetic limit.",
      severity: "high",
      date: "Today"
    },
    {
      id: "personal-2",
      title: "Sodium consecutive intake",
      description: "Your sodium intake has exceeded 1500mg for 3 consecutive days.",
      severity: "medium",
      date: "Yesterday"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-3xl text-white tracking-tight">🚨 Notifications & Alerts Feed</h1>
        <p className="text-slate-400 text-xs mt-1">Official FSSAI product recall notices and personal threshold exposure alerts.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-4">
        <button
          onClick={() => setActiveTab('official')}
          className={`pb-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'official' ? 'border-b-2 border-emerald-500 text-white' : 'text-slate-400'
          }`}
        >
          Official Recalls (FSSAI)
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'personal' ? 'border-b-2 border-emerald-500 text-white' : 'text-slate-400'
          }`}
        >
          Personal Warnings ({personalAlerts.length})
        </button>
      </div>

      {/* Tab Panel */}
      <div className="flex flex-col gap-4">
        {activeTab === 'official' && (
          <div className="flex flex-col gap-4">
            {officialRecalls.map(r => (
              <div key={r.id} className="glass-card rounded-2xl border border-amber-500/20 bg-slate-950/40 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    {r.alert_type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500">{r.issued_date}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{r.title}</h3>
                  <span className="text-xs text-slate-500">{r.brand}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  {r.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-3">
                  <span>Reference: {r.fssai_reference}</span>
                  <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-bold">
                    Official Notice Link →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="flex flex-col gap-4">
            {personalAlerts.map(a => (
              <div key={a.id} className={`glass-card rounded-2xl p-5 border flex items-start gap-4 ${
                a.severity === 'high' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
              }`}>
                <span className="text-2xl mt-0.5">{a.severity === 'high' ? '🔴' : '🟡'}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm leading-tight">{a.title}</h3>
                    <span className="text-[10px] text-slate-500">{a.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
