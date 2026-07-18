'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface AuditResult {
  pantryScore: number;
  totalProducts: number;
  harmfulSubstancesCount: number;
  worstOffenders: any[];
  healthySwaps: any[];
}

export default function PantryAuditPage() {
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [productList, setProductList] = useState<any[]>([]);

  useEffect(() => {
    // Load pre-seeded products for audit checklist
    async function loadProducts() {
      try {
        const res = await fetch('/api/products/search?q=a');
        if (res.ok) setProductList(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    loadProducts();
  }, []);

  const handleCheckboxChange = (barcode: string) => {
    setSelectedBarcodes(prev => {
      const exists = prev.includes(barcode);
      return exists ? prev.filter(b => b !== barcode) : [...prev, barcode];
    });
  };

  const handleRunAudit = async () => {
    if (selectedBarcodes.length === 0) {
      alert("Please select at least one item from your pantry to audit.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pantry/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcodes: selectedBarcodes })
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
        // Fireworks confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b']
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPantryGrade = (score: number) => {
    if (score >= 8.5) return { letter: 'A+', color: 'text-emerald-400', desc: 'Outstanding! Your pantry is exceptionally clean and whole-grain dense.' };
    if (score >= 7.0) return { letter: 'B', color: 'text-teal-400', desc: 'Good! Your pantry contains mostly healthy choices, with minor processed snacks.' };
    if (score >= 5.0) return { letter: 'C', color: 'text-amber-400', desc: 'Caution. Your pantry contains significant processed additives and palm oil.' };
    return { letter: 'D-', color: 'text-red-400', desc: 'Alert. Your pantry is dominated by maida-heavy foods, trans fats, and harmful preservatives.' };
  };

  const grade = auditResult ? getPantryGrade(auditResult.pantryScore) : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-3xl text-white tracking-tight">🧺 Kitchen Pantry Audit</h1>
        <p className="text-slate-400 text-xs mt-1">Audit your entire kitchen pantry in one session, identify toxic chemical exposure, and find healthy swaps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Select items checklist */}
        <div className="md:col-span-5 flex flex-col gap-5">
          <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
            <h2 className="font-display font-extrabold text-base text-white">Select Pantry Items</h2>
            <p className="text-slate-400 text-[11px] leading-normal">
              Check all the items currently present in your kitchen pantry or refrigerator:
            </p>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {productList.map(p => {
                const checked = selectedBarcodes.includes(p.barcode);
                return (
                  <label 
                    key={p.barcode} 
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      checked 
                        ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                        : 'border-white/5 bg-slate-900/40 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => handleCheckboxChange(p.barcode)}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <span className="font-bold block">{p.name}</span>
                        <span className="text-[10px] text-slate-500">{p.brand}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <button
              onClick={handleRunAudit}
              disabled={loading || selectedBarcodes.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              {loading ? 'Analyzing Pantry...' : 'Generate Pantry Health Report Card 🚀'}
            </button>
          </div>
        </div>

        {/* Right Side: Pantry Audit Report Card results */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {auditResult && grade ? (
            <div className="flex flex-col gap-6 animate-pop">
              {/* Grade Report Card */}
              <div className="glass-card rounded-2xl border border-emerald-500/20 bg-slate-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pantry Health Index</span>
                  <span className={`font-display font-black text-6xl leading-tight ${grade.color}`}>
                    {grade.letter}
                  </span>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{grade.desc}</p>
                </div>
                <div className="flex flex-col text-center sm:text-right gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Pantry Score</span>
                    <span className="text-xl font-black text-white">{auditResult.pantryScore} / 10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Toxic Chemicals Found</span>
                    <span className="text-xl font-black text-red-400">{auditResult.harmfulSubstancesCount}</span>
                  </div>
                </div>
              </div>

              {/* Worst Offenders list */}
              {auditResult.worstOffenders.length > 0 && (
                <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col gap-3">
                  <h3 className="font-display font-extrabold text-sm text-white">⚠️ Worst Pantry Offenders</h3>
                  <div className="flex flex-col gap-2">
                    {auditResult.worstOffenders.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                        <span className="font-semibold text-slate-300">{p.name} ({p.brand})</span>
                        <span className="font-bold text-red-400">Score: {p.health_score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Healthy swaps recommendations */}
              {auditResult.healthySwaps.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-display font-extrabold text-sm text-white">🌱 Healthy Pantry Swaps</h3>
                  <div className="flex flex-col gap-3">
                    {auditResult.healthySwaps.map((swap, i) => (
                      <div key={i} className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">Instead of: <span className="text-red-400 font-bold">{swap.originalProduct}</span></span>
                          <span className="text-emerald-400 font-bold">Use Mapped Swap: {swap.swapProduct}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          {swap.reason}
                        </p>
                        <Link
                          href={`/product/${swap.swapBarcode}`}
                          className="text-[10px] text-emerald-400 font-bold hover:underline self-end"
                        >
                          View Swap Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/10 border border-white/5 rounded-2xl border-dashed">
              <span className="text-5xl block mb-4">📊</span>
              <h3 className="font-display font-bold text-base text-slate-300">Pantry Report Awaiting Audit</h3>
              <p className="text-slate-500 text-xs max-w-xs mt-1">Select items in your kitchen cabinet on the left checklist and run the audit to analyze your report card.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
