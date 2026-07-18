'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface ProductViewProps {
  barcode: string;
}

export function ProductView({ barcode }: ProductViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [verdict, setVerdict] = useState<any>(null);
  
  // Diary logging states
  const [quantity, setQuantity] = useState('full'); // full, half, custom
  const [customGrams, setCustomGrams] = useState('100');
  const [mealType, setMealType] = useState('snack');
  const [logging, setLogging] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch barcode details
        const prodRes = await fetch('/api/scan/barcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode })
        });
        
        if (!prodRes.ok) throw new Error("Product retrieval failed.");
        const prodData = await prodRes.ok ? await prodRes.json() : null;
        setProduct(prodData);

        // 2. Fetch user profile
        const profRes = await fetch('/api/user/profile');
        const profData = profRes.ok ? await profRes.json() : null;
        setProfile(profData);

        if (prodData && profData) {
          // 3. Fetch personalized verdict
          const verdRes = await fetch('/api/scan/verdict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product: prodData, profile: profData })
          });
          const verdData = await verdRes.json();
          setVerdict(verdData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [barcode]);

  const handleLogFood = async () => {
    if (!product) return;
    setLogging(true);

    let grams = product.pack_size_g || 100;
    if (quantity === 'half') grams = Math.round(grams / 2);
    else if (quantity === 'custom') grams = parseFloat(customGrams) || 100;

    try {
      const res = await fetch('/api/diary/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.barcode,
          meal_type: mealType,
          quantity_g: grams
        })
      });

      if (res.ok) {
        setLoggedSuccess(true);
        // Confetti explosion!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
        setTimeout(() => setLoggedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-16 w-3/4 bg-slate-900 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 h-[300px] bg-slate-900 rounded-2xl"></div>
          <div className="md:col-span-7 h-[300px] bg-slate-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 text-center">
        <span className="text-5xl block mb-4">🔎</span>
        <h2 className="font-display font-black text-2xl text-white">Product Not Found</h2>
        <p className="text-slate-400 text-xs mt-2 mb-6">This barcode is not yet registered in our database.</p>
        <div className="flex flex-col gap-2">
          <Link href="/scan" className="py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold rounded-xl text-xs">
            Try Scannng Again
          </Link>
          <Link href="/" className="py-3 border border-white/5 hover:bg-white/5 text-slate-300 font-bold rounded-xl text-xs">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Set colors dynamically based on verdict
  const verdictColor = 
    verdict?.verdict === 'SAFE' 
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
      : verdict?.verdict === 'CAUTION'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-red-400 bg-red-500/10 border-red-500/20';

  const progressDashoffset = 339 - (339 * (verdict?.score || product.health_score || 5.0)) / 10;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Product Header */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-xl bg-slate-950 flex items-center justify-center text-3xl border border-white/5">
            🍟
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">{product.name}</h1>
              <span className={`w-3 h-3 rounded-full shrink-0 ${product.is_vegetarian ? 'bg-emerald-500' : 'bg-red-500'}`} 
                    title={product.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian'} />
            </div>
            <span className="text-slate-400 text-sm">{product.brand}</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg">
          Barcode: <span className="font-mono text-slate-300">{product.barcode}</span>
        </div>
      </div>

      {/* Primary Score & Verdict Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Circular score Dial & Personal Verdict */}
        <div className="md:col-span-5 glass-card rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center">
          {/* Animated Score Dial */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="68" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent" />
              <circle 
                cx="80" 
                cy="80" 
                r="68" 
                stroke={verdict?.verdict === 'SAFE' ? '#10b981' : verdict?.verdict === 'CAUTION' ? '#f59e0b' : '#ef4444'} 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="427" 
                strokeDashoffset={427 - (427 * (verdict?.score || product.health_score || 5.0)) / 10} 
                className="stroke-linecap-round transition-all duration-1000" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`font-display font-black text-5xl ${
                verdict?.verdict === 'SAFE' ? 'text-emerald-400' : verdict?.verdict === 'CAUTION' ? 'text-amber-400' : 'text-red-400'
              }`}>{verdict?.score || product.health_score}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Health Index</span>
            </div>
          </div>

          <div className={`w-full py-3.5 border rounded-xl font-black text-center text-sm uppercase tracking-widest ${verdictColor} mb-2`}>
            {verdict?.verdict || 'CAUTION'} VERDICT
          </div>
          
          <span className="text-[10px] text-slate-500 font-bold uppercase text-center mt-1">
            Personalized for {profile?.name || 'Your Profile'} ({profile?.conditions?.join(', ') || 'No conditions'})
          </span>
        </div>

        {/* Right Side: Detailed Health warnings "For You" */}
        <div className="md:col-span-7 glass-card rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-extrabold text-lg text-white mb-4">🔍 Clinical Analysis for YOU</h2>
            <div className="flex flex-col gap-4">
              {verdict?.reasons?.map((reason: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-red-400 text-lg mt-0.5">⚠️</span>
                  <p>{reason}</p>
                </div>
              )) || (
                <div className="text-slate-400 text-xs">No serious personalized health flags found.</div>
              )}
            </div>
          </div>

          {/* Dangerous combos or pregnant/med warnings */}
          {profile?.medications?.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <span>💊</span>
              <div>
                <span className="font-bold">Medication Interaction:</span> Ensure thyroxine or metformin is taken 2+ hours apart from food additives or high calcium bindings.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claim Checker Section */}
      {verdict?.claimChecker && verdict.claimChecker.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
          <h2 className="font-display font-extrabold text-lg text-white">🏷️ Packet Claim Verification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {verdict.claimChecker.map((claim: any, idx: number) => (
              <div key={idx} className={`p-4 rounded-xl border flex flex-col gap-1.5 ${
                claim.honest 
                  ? 'border-emerald-500/10 bg-emerald-500/5' 
                  : 'border-red-500/10 bg-red-500/5'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">"{claim.claim}"</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    claim.honest ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {claim.honest ? 'HONEST' : 'MISLEADING'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">{claim.reality}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Harmful Substances / Preservatives section */}
      <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
        <h2 className="font-display font-extrabold text-lg text-white">🚫 Toxic Additives & Chemicals Present</h2>
        
        {product.ingredients?.some((i: any) => i.substance_id || i.e_number) ? (
          <div className="flex flex-col gap-4">
            {product.ingredients
              .filter((i: any) => i.substance_id || i.e_number)
              .map((ing: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧪</span>
                    <div>
                      <span className="font-bold text-white text-sm block">
                        {ing.name} {ing.e_number ? `(${ing.e_number})` : ''}
                      </span>
                      <span className="text-xs text-slate-400 block max-w-md">
                        Frequently used as synthetic color/preservative in instant foods.
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      ⚠️ BANNED IN JAPAN/NORWAY
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-400 text-xs">
            <span>🛡️</span> Congratulations! This product does not contain any flagged harmful food chemicals.
          </div>
        )}
      </div>

      {/* Serving Size & Nutrition Comparison Table */}
      <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
        <h2 className="font-display font-extrabold text-lg text-white">📊 The Serving Size Trick</h2>
        <p className="text-slate-400 text-xs leading-normal">
          Manufacturers print stats for small serving sizes (e.g. 30g) to make calories look low, but standard consumption is much higher. Here is what you actually consume:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400">
                <th className="py-2.5 font-bold uppercase">Nutrient</th>
                <th className="py-2.5 font-bold uppercase">Per 100g</th>
                <th className="py-2.5 font-bold uppercase">Per Serving ({product.serving_size_g}g)</th>
                <th className="py-2.5 font-bold uppercase text-emerald-400">Per Full Pack ({product.pack_size_g}g)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
              <tr>
                <td className="py-3 font-semibold text-white">Energy (Calories)</td>
                <td className="py-3">{product.nutrition?.energy_kcal || 0} kcal</td>
                <td className="py-3">{Math.round((product.nutrition?.energy_kcal || 0) * (product.serving_size_g / 100))} kcal</td>
                <td className="py-3 text-emerald-400">{Math.round((product.nutrition?.energy_kcal || 0) * (product.pack_size_g / 100))} kcal</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Sugars (g)</td>
                <td className="py-3">{product.nutrition?.sugars_g || 0}g</td>
                <td className="py-3">{Math.round((product.nutrition?.sugars_g || 0) * (product.serving_size_g / 100) * 10) / 10}g</td>
                <td className="py-3 text-emerald-400">{Math.round((product.nutrition?.sugars_g || 0) * (product.pack_size_g / 100) * 10) / 10}g</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Sodium (mg)</td>
                <td className="py-3">{product.nutrition?.sodium_mg || 0}mg</td>
                <td className="py-3">{Math.round((product.nutrition?.sodium_mg || 0) * (product.serving_size_g / 100))}mg</td>
                <td className="py-3 text-emerald-400">{Math.round((product.nutrition?.sodium_mg || 0) * (product.pack_size_g / 100))}mg</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Protein (g)</td>
                <td className="py-3">{product.nutrition?.protein_g || 0}g</td>
                <td className="py-3">{Math.round((product.nutrition?.protein_g || 0) * (product.serving_size_g / 100) * 10) / 10}g</td>
                <td className="py-3 text-emerald-400">{Math.round((product.nutrition?.protein_g || 0) * (product.pack_size_g / 100) * 10) / 10}g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add to Diary CTA */}
      <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        {loggedSuccess && (
          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-md flex items-center justify-center text-sm font-bold text-emerald-400 z-10 animate-pop">
            Logged successfully to Food Diary! 🎉
          </div>
        )}
        
        <div>
          <h2 className="font-display font-extrabold text-lg text-white">📔 Add to Food Diary</h2>
          <p className="text-slate-400 text-xs mt-1">Track this consumption in your daily dashboard.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={mealType} 
            onChange={e => setMealType(e.target.value)}
            className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>

          <select 
            value={quantity} 
            onChange={e => setQuantity(e.target.value)}
            className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="full">Full Pack ({product.pack_size_g}g)</option>
            <option value="half">Half Pack ({Math.round(product.pack_size_g / 2)}g)</option>
            <option value="custom">Custom Weight (g)</option>
          </select>

          {quantity === 'custom' && (
            <input 
              type="number" 
              value={customGrams} 
              onChange={e => setCustomGrams(e.target.value)}
              className="w-20 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
            />
          )}

          <button
            onClick={handleLogFood}
            disabled={logging}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {logging ? 'Logging...' : 'Confirm Consumption Log'}
          </button>
        </div>
      </div>

      {/* Mapped Smart Alternatives Section */}
      {product.alternatives && product.alternatives.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display font-extrabold text-lg text-white">🌱 Healthy Swaps Mapped For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.alternatives.map((alt: any, idx: number) => (
              <div key={idx} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🥦</span>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{alt.name || alt.alternative_barcode}</h3>
                    <span className="text-slate-500 text-xs">{alt.brand || 'Clean Brand'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  {alt.reason}
                </p>
                <Link
                  href={`/product/${alt.alternative_barcode}`}
                  className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-center font-bold text-xs rounded-xl transition-all"
                >
                  View Details & Score →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
