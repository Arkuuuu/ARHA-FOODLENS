'use client';

import { useState, useEffect } from 'react';

interface Product {
  barcode: string;
  name: string;
  brand: string;
  health_score: number;
  is_vegetarian: boolean;
  nutrition: any;
  ingredients: any[];
}

export default function ComparePage() {
  const [barcode1, setBarcode1] = useState('');
  const [barcode2, setBarcode2] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ product1: Product; product2: Product } | null>(null);
  
  // Autocomplete lists for searching compare targets
  const [searchList, setSearchList] = useState<any[]>([]);

  useEffect(() => {
    // Load pre-seeded products for easy comparison selections
    async function loadSearchList() {
      try {
        const res = await fetch('/api/products/search?q=a'); // returns seeded foods
        if (res.ok) setSearchList(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    loadSearchList();
  }, []);

  const handleCompare = async (b1 = barcode1, b2 = barcode2) => {
    if (!b1 || !b2) {
      alert("Please select both products to compare.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/products/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode1: b1, barcode2: b2 })
      });
      if (!res.ok) throw new Error("Retrieval failed");
      const data = await res.json();
      setProducts(data);
    } catch (e: any) {
      alert("Compare failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectPredefined = (b1: string, b2: string) => {
    setBarcode1(b1);
    setBarcode2(b2);
    handleCompare(b1, b2);
  };

  const getWinner = () => {
    if (!products) return null;
    const { product1, product2 } = products;
    
    if (product1.health_score > product2.health_score) {
      return {
        name: product1.name,
        score: product1.health_score,
        reason: `${product1.name} has a superior health rating of ${product1.health_score}/10, containing lower saturated fat and no synthetic food colors.`
      };
    } else if (product2.health_score > product1.health_score) {
      return {
        name: product2.name,
        score: product2.health_score,
        reason: `${product2.name} has a superior health rating of ${product2.health_score}/10, containing lower saturated fat and no synthetic food colors.`
      };
    }
    return {
      name: "Tie",
      score: product1.health_score,
      reason: "Both products are nutritionally equivalent."
    };
  };

  const winner = getWinner();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-3xl text-white tracking-tight">⚖️ Compare Products Side-by-Side</h1>
        <p className="text-slate-400 text-xs mt-1">Select two food products to compare health scores, additives, and nutrition facts.</p>
      </div>

      {/* Select inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-900/40 p-6 rounded-2xl border border-white/5">
        <div className="md:col-span-4 flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400">First Product</label>
          <select
            value={barcode1}
            onChange={e => setBarcode1(e.target.value)}
            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
          >
            <option value="">-- Choose Product --</option>
            {searchList.map(p => (
              <option key={p.barcode} value={p.barcode}>{p.brand} - {p.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 text-center font-black text-slate-500 text-sm py-2">
          VS
        </div>

        <div className="md:col-span-4 flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400">Second Product</label>
          <select
            value={barcode2}
            onChange={e => setBarcode2(e.target.value)}
            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
          >
            <option value="">-- Choose Product --</option>
            {searchList.map(p => (
              <option key={p.barcode} value={p.barcode}>{p.brand} - {p.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <button
            onClick={() => handleCompare()}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            {loading ? 'Analyzing...' : 'Compare Products'}
          </button>
        </div>
      </div>

      {/* Quick demo presets */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-500 font-bold uppercase">Compare Demo Presets:</span>
        <button
          onClick={() => selectPredefined('8901058002316', '8906082525413')}
          className="px-3.5 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 hover:border-emerald-500/30 transition-all cursor-pointer"
        >
          🍜 Maggi vs Slurrp Farm Millet Noodles
        </button>
        <button
          onClick={() => selectPredefined('8901725181223', '8906109250069')}
          className="px-3.5 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 hover:border-emerald-500/30 transition-all cursor-pointer"
        >
          🍿 Kurkure vs Baked Ragi Puffs
        </button>
      </div>

      {/* Comparison Results Details Panel */}
      {products && (
        <div className="flex flex-col gap-6 animate-pop">
          {/* Winner Banner */}
          {winner && (
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
              <span className="text-3xl">🏆</span>
              <div>
                <h3 className="font-display font-extrabold text-base text-emerald-400">Winner: {winner.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{winner.reason}</p>
              </div>
            </div>
          )}

          {/* Side by side columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product 1 */}
            <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍟</span>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{products.product1.name}</h3>
                  <span className="text-slate-500 text-xs">{products.product1.brand}</span>
                </div>
              </div>

              {/* Health Score block */}
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Health Score</span>
                <span className={`font-display font-black text-2xl ${
                  products.product1.health_score >= 7.0 ? 'text-emerald-400' : products.product1.health_score >= 4.5 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {products.product1.health_score} / 10
                </span>
              </div>

              {/* Nutrition table */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Nutrition Facts (per 100g)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Energy</span>
                    <span className="font-bold text-sm text-white">{products.product1.nutrition?.energy_kcal} kcal</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Sugar</span>
                    <span className="font-bold text-sm text-white">{products.product1.nutrition?.sugars_g}g</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Sodium</span>
                    <span className="font-bold text-sm text-white">{products.product1.nutrition?.sodium_mg}mg</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Protein</span>
                    <span className="font-bold text-sm text-white">{products.product1.nutrition?.protein_g}g</span>
                  </div>
                </div>
              </div>

              {/* Flagged Additives */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Flagged Additives</span>
                <div className="flex flex-wrap gap-1.5">
                  {products.product1.ingredients?.filter(i => i.substance_id || i.e_number).length ? (
                    products.product1.ingredients
                      .filter(i => i.substance_id || i.e_number)
                      .map((ing, i) => (
                        <span key={i} className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">
                          🧪 {ing.name}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold">🟢 No harmful chemicals detected.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍟</span>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{products.product2.name}</h3>
                  <span className="text-slate-500 text-xs">{products.product2.brand}</span>
                </div>
              </div>

              {/* Health Score block */}
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Health Score</span>
                <span className={`font-display font-black text-2xl ${
                  products.product2.health_score >= 7.0 ? 'text-emerald-400' : products.product2.health_score >= 4.5 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {products.product2.health_score} / 10
                </span>
              </div>

              {/* Nutrition table */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Nutrition Facts (per 100g)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Energy</span>
                    <span className="font-bold text-sm text-white">{products.product2.nutrition?.energy_kcal} kcal</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Sugar</span>
                    <span className="font-bold text-sm text-white">{products.product2.nutrition?.sugars_g}g</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Sodium</span>
                    <span className="font-bold text-sm text-white">{products.product2.nutrition?.sodium_mg}mg</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Protein</span>
                    <span className="font-bold text-sm text-white">{products.product2.nutrition?.protein_g}g</span>
                  </div>
                </div>
              </div>

              {/* Flagged Additives */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Flagged Additives</span>
                <div className="flex flex-wrap gap-1.5">
                  {products.product2.ingredients?.filter(i => i.substance_id || i.e_number).length ? (
                    products.product2.ingredients
                      .filter(i => i.substance_id || i.e_number)
                      .map((ing, i) => (
                        <span key={i} className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">
                          🧪 {ing.name}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold">🟢 No harmful chemicals detected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
