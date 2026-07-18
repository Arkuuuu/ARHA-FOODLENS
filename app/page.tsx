'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductSearchResult {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  health_score: number;
  image_url?: string;
  is_vegetarian?: boolean;
}

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col items-center">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="w-full max-w-5xl px-4 pt-16 pb-12 sm:pt-24 text-center flex flex-col items-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6 shadow-md shadow-emerald-500/5 animate-pulse">
          <span>✨</span> India's First AI-Powered Food Scanner
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight leading-[1.1] mb-6 max-w-3xl">
          Know What is <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent glow-text-green">Really Inside</span> Your Packaged Food
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-xl mb-10 leading-relaxed">
          Scan barcodes to instantly expose chemical additives, globally banned preservatives, and serving size tricks—fully personalized to your unique health profile.
        </p>

        {/* Direct Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-16">
          <Link
            href="/scan"
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black rounded-xl shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:scale-[1.03] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2.5 text-sm"
          >
            <span className="text-lg">📷</span> Start Scanning Now
          </Link>
          <Link
            href="/pantry"
            className="px-8 py-4 bg-slate-900/60 border border-white/5 hover:border-white/10 hover:bg-slate-900 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-150"
          >
            <span>🧺</span> Pantry Audit
          </Link>
        </div>

        {/* Autocomplete Manual Search */}
        <div className="w-full max-w-md relative mb-24">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="Search Indian products manually..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 focus:border-emerald-500/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none backdrop-blur-md shadow-2xl transition-all"
            />
            {loadingSearch && (
              <span className="absolute right-4 top-4 text-xs text-emerald-400 animate-spin">⎔</span>
            )}
          </div>

          {/* Autocomplete Results Panel */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-30 glass-card rounded-xl border border-white/10 overflow-hidden shadow-2xl animate-pop">
              {searchResults.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => router.push(`/product/${prod.barcode}`)}
                  className="w-full px-4 py-3.5 hover:bg-slate-900/80 text-left border-b border-white/5 flex items-center justify-between text-sm transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🍟</span>
                    <div>
                      <span className="font-bold text-white block leading-tight">{prod.name}</span>
                      <span className="text-xs text-slate-500">{prod.brand}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prod.health_score >= 7.0 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : prod.health_score >= 4.5
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      Score: {prod.health_score}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Highlight Demonstration Card (The "Wow" Section) */}
      <section className="w-full max-w-4xl px-4 pb-24 relative z-10 flex flex-col items-center">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-8 text-center">
          What happens when you scan?
        </h2>

        <div className="w-full glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/5 blur-[80px]" />

          {/* Left Column - Product Graphic & score */}
          <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-8">
            <span className="text-6xl mb-4 animate-bounce">🍜</span>
            <h3 className="font-display font-extrabold text-xl text-white text-center">Maggi Noodles</h3>
            <span className="text-slate-500 text-xs mb-6">Nestle India</span>

            {/* Score Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="8" fill="transparent" />
                <circle cx="64" cy="64" r="54" stroke="#ef4444" strokeWidth="8" fill="transparent" 
                        strokeDasharray="339" strokeDashoffset="254" className="stroke-linecap-round transition-all duration-1000" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display font-black text-3xl text-red-500">2.5</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Health Score</span>
              </div>
            </div>

            <span className="mt-4 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
              🔴 AVOID FOR DIABETICS
            </span>
          </div>

          {/* Right Column - Personalized Health Breakdown */}
          <div className="md:col-span-7 flex flex-col gap-5 justify-center">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verdict for you (Diabetic Profile):</span>
              <h4 className="font-bold text-white text-base mt-1">High Refined Flour Load & Preservative Flags</h4>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="text-red-500">⚠️</span>
                <div>
                  <span className="font-bold text-white">82% Refined Flour (Maida):</span> Strips fiber, causes immediate blood sugar spikes.
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="text-red-500">⚠️</span>
                <div>
                  <span className="font-bold text-white">TBHQ (Preservative E319):</span> Linked to chemical cellular damage; banned in food in Japan.
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="text-red-500">⚠️</span>
                <div>
                  <span className="font-bold text-white">1250mg Sodium:</span> Exceeds 60% of your daily clinical BP boundary in one packet.
                </div>
              </div>
            </div>

            {/* Smart Swap Recommendation */}
            <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wide block">Better Swap</span>
                  <span className="font-semibold text-white text-xs">Slurrp Farm Ragi Noodles (Health Score: 8.5)</span>
                </div>
              </div>
              <Link href="/product/8906082525413" className="text-xs text-emerald-400 font-bold hover:underline">
                View →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="w-full max-w-5xl px-4 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-3">
          <span className="text-3xl">🚫</span>
          <h3 className="font-display font-extrabold text-lg text-white">Additive Watchdog</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Identifies colors and toxic preservatives banned in Europe, USA, or Japan, but legally used in Indian food packages.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-3">
          <span className="text-3xl">👥</span>
          <h3 className="font-display font-extrabold text-lg text-white">Family Profiles</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Configure individual parameters for children, pregnant family members, or grandparents to evaluate scans for everyone simultaneously.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-3">
          <span className="text-3xl">📔</span>
          <h3 className="font-display font-extrabold text-lg text-white">Real Food Log</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Quantify absolute sugar and sodium intakes from daily logs, exposing serving size tricks by scaling to actual eaten weights.
          </p>
        </div>
      </section>
    </div>
  );
}
