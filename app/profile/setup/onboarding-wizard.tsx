'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: 'Type 2 Diabetes', desc: 'Triggers strict sugar, GI, and carbohydrate warnings.' },
  { id: 'prediabetes', label: 'Pre-diabetes', desc: 'Alerts when products spike blood sugar fast.' },
  { id: 'hypertension', label: 'Hypertension', desc: 'Triggers severe warnings on high-sodium ingredients.' },
  { id: 'pcod', label: 'PCOD / PCOS', desc: 'Flags refined carbs, high sugars, and trans fats.' },
  { id: 'thyroid', label: 'Thyroid Issue', desc: 'Warns about soy and absorption-interfering additives.' },
  { id: 'cholesterol', label: 'High Cholesterol', desc: 'Deducts score for saturated and trans fats.' },
  { id: 'kidney', label: 'Kidney Disease', desc: 'Strictly monitors potassium, sodium, and phosphates.' },
  { id: 'liver', label: 'Liver Issues', desc: 'Flags chemical preservatives like TBHQ, BHA, and BHT.' },
  { id: 'heart', label: 'Heart Conditions', desc: 'Strictly monitors trans fat, palm oil, and high sodium.' }
];

const ALLERGIES = [
  { id: 'gluten', label: 'Gluten / Wheat', desc: 'Detects wheat, barley, rye, malt, and flour.' },
  { id: 'lactose', label: 'Lactose / Dairy', desc: 'Detects milk, butter, cheese, whey, and casein.' },
  { id: 'nuts', label: 'Tree Nuts', desc: 'Detects cashews, almonds, walnuts, etc.' },
  { id: 'peanuts', label: 'Peanuts', desc: 'Flags peanut butter, peanut oil, etc.' },
  { id: 'soy', label: 'Soy / Soya', desc: 'Flags soy lecithin, soy protein, and soy sauce.' },
  { id: 'eggs', label: 'Eggs', desc: 'Detects egg powder, albumin, and lecithin.' }
];

const DIETARY_TYPES = [
  { id: 'vegetarian', label: 'Vegetarian 🟢', desc: 'Flags gelatin, animal fats, and E120 (carmine dye).' },
  { id: 'vegan', label: 'Vegan 🌱', desc: 'Flags dairy, honey, egg, gelatin, and whey.' },
  { id: 'jain', label: 'Jain 🟡', desc: 'Flags all root vegetables (potatoes, onions, garlic).' },
  { id: 'halal', label: 'Halal ☪️', desc: 'Flags pork derivatives, gelatin, and alcohol.' },
  { id: 'non_veg', label: 'Non-Vegetarian 🔴', desc: 'Allows all ingredients.' }
];

const GOALS = [
  { id: 'general', label: 'General Well-being', desc: 'Maintain clean eating and chemical awareness.' },
  { id: 'weight_loss', label: 'Weight Loss / Calorie Deficit', desc: 'Flags high calorie density and hidden fats.' },
  { id: 'muscle_gain', label: 'Muscle Gain / Protein Focus', desc: 'Highlights protein content and claims honesty.' },
  { id: 'control_sugar', label: 'Control Sugar Intake', desc: 'Tracks added sugars and artificial sweeteners.' },
  { id: 'manage_bp', label: 'Manage Blood Pressure', desc: 'Focuses heavily on low-sodium alternatives.' },
  { id: 'gut_health', label: 'Improve Gut Health', desc: 'Flags emulsifiers (carrageenan) and artificial sweeteners.' }
];

const MEDICATIONS = [
  { id: 'metformin', label: 'Metformin (Diabetes)', desc: 'Warns about excessive sugar/carb products.' },
  { id: 'thyroxine', label: 'Thyroxine (Thyroid)', desc: 'Flags soy and high calcium fortifiers (blocks absorption).' },
  { id: 'warfarin', label: 'Warfarin / Blood Thinners', desc: 'Flags Vitamin K dense foods and excessive alcohol.' },
  { id: 'ace_inhibitors', label: 'ACE Inhibitors (Blood Pressure)', desc: 'Flags products extremely high in potassium.' },
  { id: 'statins', label: 'Statins (Cholesterol)', desc: 'Flags grapefruit derivatives in citrus mixes.' }
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Welcome, 1: Basic Info, 2: Conditions, 3: Allergies/Diet, 4: Goals, 5: Meds
  const [loading, setLoading] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: 'male',
    weight_kg: '',
    height_cm: '',
    activity_level: 'sedentary',
    conditions: [] as string[],
    allergies: [] as string[],
    dietary_type: 'non_veg',
    goals: ['general'] as string[],
    medications: [] as string[],
    is_pregnant: false,
    pregnancy_week: 0
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(prev => ({
            ...prev,
            ...data,
            goals: data.goals || (data.goal ? [data.goal] : ['general']),
            // make sure numeric/string fields are populated correctly
            age: data.age || '',
            weight_kg: data.weight_kg || '',
            height_cm: data.height_cm || ''
          }));
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }
    fetchProfile();
  }, []);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(0, prev - 1));

  const toggleCondition = (id: string) => {
    setProfile(prev => {
      const active = prev.conditions.includes(id);
      return {
        ...prev,
        conditions: active 
          ? prev.conditions.filter(c => c !== id)
          : [...prev.conditions, id]
      };
    });
  };

  const toggleAllergy = (id: string) => {
    setProfile(prev => {
      const active = prev.allergies.includes(id);
      return {
        ...prev,
        allergies: active 
          ? prev.allergies.filter(a => a !== id)
          : [...prev.allergies, id]
      };
    });
  };

  const toggleGoal = (id: string) => {
    setProfile(prev => {
      const active = prev.goals?.includes(id) || false;
      return {
        ...prev,
        goals: active 
          ? prev.goals.filter(g => g !== id)
          : [...(prev.goals || []), id]
      };
    });
  };

  const toggleMedication = (id: string) => {
    setProfile(prev => {
      const active = prev.medications.includes(id);
      return {
        ...prev,
        medications: active 
          ? prev.medications.filter(m => m !== id)
          : [...prev.medications, id]
      };
    });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const formatted = {
        ...profile,
        age: parseInt(profile.age) || 28,
        weight_kg: parseFloat(profile.weight_kg) || 70,
        height_cm: parseFloat(profile.height_cm) || 170,
        pregnancy_week: profile.is_pregnant ? parseInt(profile.pregnancy_week as any) || 12 : 0,
        profile_mode: (parseInt(profile.age) < 18) ? 'child' : (parseInt(profile.age) >= 60 ? 'senior' : 'adult')
      };

      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted)
      });

      if (!res.ok) throw new Error("Failed to save profile");
      
      router.push('/dashboard?setup=success');
    } catch (e) {
      console.error(e);
      alert("Error saving profile. Using local offline setup.");
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / 5) * 100;

  return (
    <div className="w-full max-w-2xl glass-card rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col relative overflow-hidden">
      {/* Progress Bar */}
      {step > 0 && (
        <div className="w-full bg-slate-900 h-1.5 rounded-full mb-8 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* STEP 0: Welcome Screen */}
      {step === 0 && (
        <div className="text-center flex flex-col items-center py-6 animate-pop">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-black font-black text-3xl mb-6 shadow-xl shadow-emerald-500/20">
            ⎔
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-3">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">ARHA-FoodLens</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
            India's first personalized food health companion. Set up your clinical health profile to instantly detect harmful chemicals and banned food additives tailored specifically to your body.
          </p>
          <button
            onClick={nextStep}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Create Your Health Profile
          </button>
        </div>
      )}

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <div className="flex flex-col gap-6 animate-pop">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">Tell us about yourself</h2>
            <p className="text-slate-400 text-xs">Used to estimate caloric thresholds and BMI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Name</label>
              <input
                type="text"
                placeholder="e.g. Arka"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Age (years)</label>
                <input
                  type="number"
                  placeholder="28"
                  value={profile.age}
                  onChange={e => setProfile({...profile, age: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Gender</label>
                <select
                  value={profile.gender}
                  onChange={e => setProfile({...profile, gender: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Weight (kg)</label>
              <input
                type="number"
                placeholder="70"
                value={profile.weight_kg}
                onChange={e => setProfile({...profile, weight_kg: e.target.value})}
                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Height (cm)</label>
              <input
                type="number"
                placeholder="170"
                value={profile.height_cm}
                onChange={e => setProfile({...profile, height_cm: e.target.value})}
                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {profile.gender === 'female' && (
            <div className="flex flex-col gap-3 p-4 bg-slate-900/60 border border-white/5 rounded-xl">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.is_pregnant}
                  onChange={e => setProfile({...profile, is_pregnant: e.target.checked})}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                Are you currently pregnant? (Pregnancy Mode)
              </label>
              {profile.is_pregnant && (
                <div className="flex flex-col gap-1 animate-pop">
                  <span className="text-xs text-slate-400">Pregnancy Week</span>
                  <input
                    type="number"
                    placeholder="12"
                    value={profile.pregnancy_week || ''}
                    onChange={e => setProfile({...profile, pregnancy_week: parseInt(e.target.value) || 0})}
                    className="w-32 bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Physical Activity</label>
            <select
              value={profile.activity_level}
              onChange={e => setProfile({...profile, activity_level: e.target.value})}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="sedentary">Sedentary (Office / Little Exercise)</option>
              <option value="light">Lightly Active (1-3 days exercise/week)</option>
              <option value="moderate">Moderately Active (3-5 days exercise/week)</option>
              <option value="active">Very Active (6-7 days heavy exercise/week)</option>
            </select>
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="flex-1 py-3 border border-white/5 hover:bg-white/5 rounded-xl text-slate-300 font-bold text-sm transition-colors cursor-pointer">Back</button>
            <button onClick={nextStep} disabled={!profile.name} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform duration-150 cursor-pointer">Continue</button>
          </div>
        </div>
      )}

      {/* STEP 2: Medical Conditions */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-pop">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">Do you have any medical conditions?</h2>
            <p className="text-slate-400 text-xs">Used to calibrate health scores and trigger warning alerts.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {HEALTH_CONDITIONS.map(c => {
              const active = profile.conditions.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCondition(c.id)}
                  className={`text-left p-4.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    active 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/40 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm">{c.label}</span>
                  <span className="text-[11px] text-slate-400 leading-normal">{c.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="flex-1 py-3 border border-white/5 hover:bg-white/5 rounded-xl text-slate-300 font-bold text-sm transition-colors cursor-pointer">Back</button>
            <button onClick={nextStep} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform duration-150 cursor-pointer">Continue</button>
          </div>
        </div>
      )}

      {/* STEP 3: Allergies & Dietary Type */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-pop">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">Dietary preference & Allergies</h2>
            <p className="text-slate-400 text-xs">We will red-flag ingredients matching your selection.</p>
          </div>

          {/* Dietary selection */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400">Dietary Preferences</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIETARY_TYPES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setProfile({...profile, dietary_type: d.id})}
                  className={`p-3 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                    profile.dietary_type === d.id 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/40 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies list */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 font-display">Allergies (Select all that apply)</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto">
              {ALLERGIES.map(a => {
                const active = profile.allergies.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAllergy(a.id)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      active 
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-semibold' 
                        : 'border-white/5 bg-slate-900/40 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="flex-1 py-3 border border-white/5 hover:bg-white/5 rounded-xl text-slate-300 font-bold text-sm transition-colors cursor-pointer">Back</button>
            <button onClick={nextStep} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform duration-150 cursor-pointer">Continue</button>
          </div>
        </div>
      )}

      {/* STEP 4: Goals */}
      {step === 4 && (
        <div className="flex flex-col gap-6 animate-pop">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">What are your health goals?</h2>
            <p className="text-slate-400 text-xs">Select all that apply. Customizes metric visualizer priority on dashboard.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map(g => {
              const active = profile.goals?.includes(g.id) || false;
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`text-left p-4.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    active 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/40 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm">{g.label}</span>
                  <span className="text-[11px] text-slate-400 leading-normal">{g.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="flex-1 py-3 border border-white/5 hover:bg-white/5 rounded-xl text-slate-300 font-bold text-sm transition-colors cursor-pointer">Back</button>
            <button onClick={nextStep} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform duration-150 cursor-pointer">Continue</button>
          </div>
        </div>
      )}

      {/* STEP 5: Medications */}
      {step === 5 && (
        <div className="flex flex-col gap-6 animate-pop">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">Do you take any medications? (Optional)</h2>
            <p className="text-slate-400 text-xs">Warns if ingredients block or interact poorly with medications.</p>
          </div>

          <div className="flex flex-col gap-3">
            {MEDICATIONS.map(m => {
              const active = profile.medications.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMedication(m.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-0.5 cursor-pointer ${
                    active 
                      ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                      : 'border-white/5 bg-slate-900/40 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm">{m.label}</span>
                  <span className="text-[11px] text-slate-400 leading-normal">{m.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-6">
            <button onClick={prevStep} className="flex-1 py-3 border border-white/5 hover:bg-white/5 rounded-xl text-slate-300 font-bold text-sm transition-colors cursor-pointer">Back</button>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile 🎉'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
