'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LogEntry {
  id: string;
  product_id: string;
  product_name: string;
  brand: string;
  meal_type: string;
  quantity_g: number;
  calories_consumed: number;
  sodium_consumed_mg: number;
  sugar_consumed_g: number;
  harmful_substances_consumed: string[];
}

export default function DiaryPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totals, setTotals] = useState({ calories: 0, sodium: 0, sugar: 0 });
  const [profile, setProfile] = useState<any>(null);

  // Load log data
  const loadDiary = async () => {
    try {
      const [res, profRes] = await Promise.all([
        fetch('/api/diary/log'),
        fetch('/api/user/profile')
      ]);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotals(data.totals || { calories: 0, sodium: 0, sugar: 0 });
      }
      if (profRes.ok) {
        setProfile(await profRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiary();
  }, []);

  const deleteLog = async (id: string) => {
    // Delete log locally to keep mock experience instant
    setLogs(prev => prev.filter(log => log.id !== id));
    // Re-calculate totals
    const updated = logs.filter(log => log.id !== id);
    const newTotals = updated.reduce((acc, log) => {
      acc.calories += log.calories_consumed;
      acc.sodium += log.sodium_consumed_mg;
      acc.sugar += log.sugar_consumed_g;
      return acc;
    }, { calories: 0, sodium: 0, sugar: 0 });
    setTotals(newTotals);
  };

  // Group logs by meal type
  const mealGroups = {
    breakfast: logs.filter(l => l.meal_type === 'breakfast'),
    lunch: logs.filter(l => l.meal_type === 'lunch'),
    dinner: logs.filter(l => l.meal_type === 'dinner'),
    snack: logs.filter(l => l.meal_type === 'snack')
  };

  const calLimit = profile?.daily_calorie_target || 2000;
  const sodLimit = profile?.daily_sodium_limit_mg || 2000;
  const sugLimit = profile?.daily_sugar_limit_g || 25;

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-1/4 bg-slate-900 rounded-xl"></div>
        <div className="h-40 bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Diary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">📔 Daily Food Diary</h1>
          <p className="text-slate-400 text-xs mt-1">Track what you eat and see total chemical exposures in real time.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/scan" className="px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg">
            📷 Scan Product to Log
          </Link>
        </div>
      </div>

      {/* Daily Target Progress Cards */}
      <div className="glass-card rounded-2xl border border-white/5 p-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Calories</span>
          <span className="text-lg font-black text-white">{totals.calories}</span>
          <span className="text-[10px] text-slate-400"> / {calLimit} kcal</span>
        </div>
        <div className="border-x border-white/5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sodium</span>
          <span className={`text-lg font-black ${totals.sodium > sodLimit ? 'text-red-400' : 'text-white'}`}>{totals.sodium}</span>
          <span className="text-[10px] text-slate-400"> / {sodLimit} mg</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sugar</span>
          <span className={`text-lg font-black ${totals.sugar > sugLimit ? 'text-red-400' : 'text-white'}`}>{totals.sugar}</span>
          <span className="text-[10px] text-slate-400"> / {sugLimit} g</span>
        </div>
      </div>

      {/* Meal Grouping Sections */}
      <div className="flex flex-col gap-6">
        {(Object.keys(mealGroups) as Array<keyof typeof mealGroups>).map(meal => {
          const groupLogs = mealGroups[meal];
          return (
            <div key={meal} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              {/* Meal Group Header */}
              <div className="px-5 py-3.5 bg-slate-900/60 border-b border-white/5 flex items-center justify-between">
                <span className="font-display font-black text-sm uppercase tracking-wider text-slate-300">
                  {meal === 'snack' ? '🍿 Snacks' : meal === 'breakfast' ? '🥞 Breakfast' : meal === 'lunch' ? '🍱 Lunch' : '🍛 Dinner'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  {groupLogs.length} items logged
                </span>
              </div>

              {/* Meal Group Logs List */}
              {groupLogs.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {groupLogs.map(log => (
                    <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-900/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍟</span>
                        <div>
                          <span className="font-bold text-white text-sm block leading-tight">{log.product_name}</span>
                          <span className="text-xs text-slate-500 block">{log.brand} • {log.quantity_g}g consumed</span>
                          {/* Chemicals flagged */}
                          {log.harmful_substances_consumed?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {log.harmful_substances_consumed.map((chem, i) => (
                                <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                                  🧪 {chem}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Log details & actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="flex gap-4 text-center">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Calories</span>
                            <span className="text-xs font-bold text-slate-300">{log.calories_consumed} kcal</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Sodium</span>
                            <span className="text-xs font-bold text-slate-300">{log.sodium_consumed_mg} mg</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Sugar</span>
                            <span className="text-xs font-bold text-slate-300">{log.sugar_consumed_g} g</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteLog(log.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove Log"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No food logged for {meal} today.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
