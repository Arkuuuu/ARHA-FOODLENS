'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface FamilyMember {
  id: string;
  name: string;
  relation: string; // child, spouse, parent, grandparent, etc.
  age: number;
  gender: string;
  conditions: string[];
  allergies: string[];
  dietary_type: string;
  profile_mode: string;
  is_pregnant: boolean;
}

const HEALTH_CONDITIONS = ['diabetes', 'prediabetes', 'hypertension', 'pcod', 'thyroid', 'cholesterol', 'kidney', 'liver', 'heart'];
const ALLERGIES = ['gluten', 'lactose', 'nuts', 'peanuts', 'soy', 'eggs'];

export default function FamilyPage() {
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  
  // Member Form State
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('child');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [dietaryType, setDietaryType] = useState('vegetarian');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [isPregnant, setIsPregnant] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const loadFamily = async () => {
    try {
      const res = await fetch('/api/user/family');
      if (res.ok) setFamily(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age) {
      alert("Name and age are required.");
      return;
    }

    const payload = {
      name,
      relation,
      age: parseInt(age),
      gender,
      dietary_type: dietaryType,
      conditions: selectedConditions,
      allergies: selectedAllergies,
      profile_mode: parseInt(age) < 18 ? 'child' : (parseInt(age) >= 60 ? 'senior' : 'adult'),
      is_pregnant: isPregnant
    };

    try {
      const res = await fetch('/api/user/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Success
        await loadFamily();
        // Clear fields
        setName('');
        setAge('');
        setRelation('child');
        setSelectedConditions([]);
        setSelectedAllergies([]);
        setIsPregnant(false);
        setFormOpen(false);

        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this family profile?")) return;
    try {
      const res = await fetch(`/api/user/family?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFamily(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCondition = (id: string) => {
    setSelectedConditions(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleAllergy = (id: string) => {
    setSelectedAllergies(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">👪 Family profiles</h1>
          <p className="text-slate-400 text-xs mt-1">Manage profiles for children, parents, or grandparents to scan foods for everyone simultaneously.</p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          {formOpen ? '✕ Close Form' : '➕ Add Family Member'}
        </button>
      </div>

      {/* Add Member Form */}
      {formOpen && (
        <form onSubmit={handleAddMember} className="glass-card border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 animate-pop">
          <h2 className="font-display font-extrabold text-lg text-white">Add Family Member Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
              <input
                type="text"
                placeholder="e.g. Aryan"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
              <input
                type="number"
                placeholder="e.g. 6"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Relation</label>
              <select
                value={relation}
                onChange={e => setRelation(e.target.value)}
                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="child">Child</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="grandparent">Grandparent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Dietary Type</label>
              <select
                value={dietaryType}
                onChange={e => setDietaryType(e.target.value)}
                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain</option>
                <option value="halal">Halal</option>
                <option value="non_veg">Non-Vegetarian</option>
              </select>
            </div>
            {gender === 'female' && (
              <label className="flex items-center gap-2 text-xs text-slate-300 pt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={e => setIsPregnant(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                Is Pregnant
              </label>
            )}
          </div>

          {/* Conditions checkbox lists */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Medical Conditions</span>
            <div className="flex flex-wrap gap-2">
              {HEALTH_CONDITIONS.map(c => {
                const active = selectedConditions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all cursor-pointer ${
                      active ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-white/5 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies checkbox lists */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Allergies</span>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES.map(a => {
                const active = selectedAllergies.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAllergy(a)}
                    className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all cursor-pointer ${
                      active ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-white/5 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Confirm Add Family Member Profile
          </button>
        </form>
      )}

      {/* Family profiles grid list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {family.map(member => (
          <div key={member.id} className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col justify-between gap-6 relative">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{member.relation === 'child' ? '👶' : member.relation === 'spouse' ? '👩' : '👴'}</span>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{member.name}</h3>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{member.relation} • {member.age} years • {member.gender}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove Profile"
                >
                  ✕
                </button>
              </div>

              {/* Mapped stats */}
              <div className="flex flex-col gap-2 mt-4 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Dietary Type:</span>
                  <span className="font-semibold text-slate-200 capitalize">{member.dietary_type}</span>
                </div>
                {member.conditions?.length > 0 && (
                  <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                    <span className="text-slate-400">Conditions:</span>
                    <div className="flex flex-wrap gap-1">
                      {member.conditions.map((c, i) => (
                        <span key={i} className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {member.allergies?.length > 0 && (
                  <div className="flex flex-col gap-1 py-1">
                    <span className="text-slate-400">Allergies:</span>
                    <div className="flex flex-wrap gap-1">
                      {member.allergies.map((a, i) => (
                        <span key={i} className="text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special profile settings indicator */}
            {member.profile_mode === 'child' && (
              <span className="text-[9px] font-bold text-center bg-orange-500/10 text-orange-400 border border-orange-500/20 py-2 rounded-xl">
                🧒 STRICT KIDS MODE THRESHOLDS APPLIED
              </span>
            )}
            {member.profile_mode === 'senior' && (
              <span className="text-[9px] font-bold text-center bg-blue-500/10 text-blue-400 border border-blue-500/20 py-2 rounded-xl">
                👴 SENIOR MEDICATION INTERACTION CHECKS APPLIED
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
