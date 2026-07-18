'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totals: {
    calories: number;
    sodium: number;
    sugar: number;
  };
  logs: any[];
}

interface WeeklyStats {
  dailyBreakdown: any[];
  chemicalExposures: any[];
  topLogs: any[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [dailyData, setDailyData] = useState<DashboardStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [profRes, dailyRes, weeklyRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/diary/log'),
          fetch('/api/diary/weekly')
        ]);

        if (profRes.ok) setProfile(await profRes.json());
        if (dailyRes.ok) setDailyData(await dailyRes.json());
        if (weeklyRes.ok) setWeeklyData(await weeklyRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-1/3 bg-slate-900 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-900 rounded-2xl"></div>
          <div className="h-40 bg-slate-900 rounded-2xl"></div>
          <div className="h-40 bg-slate-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Set limits
  const calorieLimit = profile?.daily_calorie_target || 2000;
  const sodiumLimit = profile?.daily_sodium_limit_mg || 2000;
  const sugarLimit = profile?.daily_sugar_limit_g || 25;

  const currentCalories = dailyData?.totals?.calories || 0;
  const currentSodium = dailyData?.totals?.sodium || 0;
  const currentSugar = dailyData?.totals?.sugar || 0;

  const caloriePct = Math.min(100, Math.round((currentCalories / calorieLimit) * 100));
  const sodiumPct = Math.min(100, Math.round((currentSodium / sodiumLimit) * 100));
  const sugarPct = Math.min(100, Math.round((currentSugar / sugarLimit) * 100));

  // Determine progress colors
  const getProgressColor = (pct: number) => {
    if (pct >= 100) return 'bg-red-500 shadow-[0_0_12px_#ef4444]';
    if (pct >= 80) return 'bg-amber-500 shadow-[0_0_12px_#f59e0b]';
    return 'bg-emerald-500 shadow-[0_0_12px_#10b981]';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">
            Hi, <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">{profile?.name || 'User'}</span> 👋
          </h1>
          <p className="text-slate-400 text-xs mt-1">Here is your clinical food safety report for today.</p>
        </div>
        <Link 
          href="/scan" 
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform duration-150 text-center"
        >
          📷 Scan Food Package
        </Link>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Card */}
        <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase">Calories Consumed</span>
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <span className="text-2xl font-black text-white">{currentCalories}</span>
            <span className="text-slate-500 text-xs"> / {calorieLimit} kcal</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(caloriePct)}`} style={{ width: `${caloriePct}%` }}></div>
          </div>
        </div>

        {/* Sodium Card */}
        <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase">Sodium Limit (BP)</span>
            <span className="text-xl">🧂</span>
          </div>
          <div>
            <span className="text-2xl font-black text-white">{currentSodium}</span>
            <span className="text-slate-500 text-xs"> / {sodiumLimit} mg</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(sodiumPct)}`} style={{ width: `${sodiumPct}%` }}></div>
          </div>
        </div>

        {/* Sugar Card */}
        <div className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase">Sugar Intake (Sugar limit)</span>
            <span className="text-xl">🍬</span>
          </div>
          <div>
            <span className="text-2xl font-black text-white">{currentSugar}</span>
            <span className="text-slate-500 text-xs"> / {sugarLimit} g</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(sugarPct)}`} style={{ width: `${sugarPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Gamification & Streaks Panel */}
      <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/10 animate-bounce">
            🔥
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg text-white">7-Day Healthy Eating Streak!</h2>
            <p className="text-slate-400 text-xs mt-0.5">You have consumed zero high-risk additives/preservatives this week. Keep it up!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-white/5 px-3 py-2 rounded-xl">
            🏆 Label Detective (Level 3)
          </span>
        </div>
      </div>

      {/* Alerts Feed & Chemical Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Active FSSAI / Personal Alerts */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <h3 className="font-display font-extrabold text-xl text-white">🚨 Active Alerts Feed</h3>
          
          <div className="flex flex-col gap-4">
            {/* Dangerous Combo Alert */}
            {currentSodium > 1000 && (
              <div className="p-4.5 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3.5 animate-pop">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-sm text-white">Sodium threshold exceeded!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Your sodium intake has exceeded 1000mg today. Retaining water can elevate vascular resistance. Consider drinking extra coconut water or water.
                  </p>
                </div>
              </div>
            )}

            {/* FSSAI recall notice */}
            <div className="p-4.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3.5">
              <span className="text-xl">📢</span>
              <div>
                <h4 className="font-bold text-sm text-white">FSSAI Spice recall alert (Turmeric)</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                  MDH and Everest spice batches flagged for ethylene oxide/lead concerns. Double check turmeric packaging licenses on your cabinets.
                </p>
                <a href="/alerts" className="text-[10px] text-amber-400 hover:underline font-bold mt-1.5 inline-block">
                  View Official Notice →
                </a>
              </div>
            </div>

            {/* Dangerous Combo logic */}
            <div className="p-4.5 bg-slate-900/60 border border-white/5 rounded-xl flex items-start gap-3.5 text-xs text-slate-300">
              <span>💡</span>
              <div>
                <span className="font-bold text-white">Dangerous Combo Check:</span> Do not combine Vitamin C beverages with Sodium Benzoate-preserved sodas within 4 hours, as this creates trace Benzene (carcinogen).
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chemical Exposure tracker */}
        <div className="md:col-span-5 glass-card rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
          <h3 className="font-display font-extrabold text-base text-white">🧪 Chemical Exposure Summary</h3>
          <p className="text-slate-400 text-xs">Exposures registered from your diary logs this month:</p>
          
          <div className="flex flex-col gap-3.5 mt-2">
            {weeklyData?.chemicalExposures && weeklyData.chemicalExposures.length > 0 ? (
              weeklyData.chemicalExposures.map((chem: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="text-xs text-slate-300 font-semibold">{chem.name}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-950 px-2.5 py-1 border border-white/5 rounded-lg text-slate-400">
                    Logged {chem.count}x
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-emerald-400 text-xs font-semibold">
                🟢 Zero chemical exposures logged this week!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
