'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ingredient {
  name: string;
  aliases: string[];
  e_number?: string;
  category: string;
  what_is_it: string;
  what_it_does_to_body: string;
  found_in_products: string[];
  is_harmful: boolean;
  risk_level?: string;
  banned_countries?: string[];
}

export default function EncyclopediaPage() {
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showHarmfulOnly, setShowHarmfulOnly] = useState(false);
  const [reverseProducts, setReverseProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadEncyclopedia() {
      try {
        const res = await fetch('/api/substances/search');
        if (res.ok) {
          const data = await res.json();
          setIngredients(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEncyclopedia();
  }, []);

  // Run reverse product lookup whenever selected ingredient changes
  useEffect(() => {
    if (!selectedIngredient) {
      setReverseProducts([]);
      return;
    }
    const currentIng = selectedIngredient;

    async function lookupProducts() {
      try {
        // Query products containing this ingredient
        const term = currentIng.name.toLowerCase();
        const res = await fetch(`/api/products/search?q=a`); // get all seeded products
        if (res.ok) {
          const allProducts = await res.json();
          const matches = allProducts.filter((p: any) => 
            p.ingredients?.some((i: any) => 
              i.name.toLowerCase().includes(term) || 
              (currentIng.e_number && i.e_number === currentIng.e_number)
            )
          );
          setReverseProducts(matches);
        }
      } catch (err) {
        console.error(err);
      }
    }
    lookupProducts();
  }, [selectedIngredient]);

  // Filters logic
  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = 
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.e_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      activeCategory === 'all' || 
      ing.category.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesHarmful = !showHarmfulOnly || ing.is_harmful;

    return matchesSearch && matchesCategory && matchesHarmful;
  });

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-1/3 bg-slate-900 rounded-xl"></div>
        <div className="h-10 w-full bg-slate-900 rounded-xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-900 rounded-xl"></div>
          <div className="h-32 bg-slate-900 rounded-xl"></div>
          <div className="h-32 bg-slate-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-3xl text-white tracking-tight">🧪 Food Ingredient Encyclopedia</h1>
        <p className="text-slate-400 text-xs mt-1">Expose the science behind packaged food ingredients and reverse lookup which products contain them.</p>
      </div>

      {/* Search & Category Filter panel */}
      <div className="flex flex-col gap-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by ingredient name or E-number (e.g. E102, palm oil, maida)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setShowHarmfulOnly(!showHarmfulOnly)}
            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showHarmfulOnly 
                ? 'border-red-500 bg-red-500/10 text-red-400' 
                : 'border-white/5 bg-slate-950 text-slate-400'
            }`}
          >
            🚫 Harmful / Banned Only
          </button>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-2">
          {['all', 'artificial_color', 'preservative', 'sweetener', 'grain', 'fat'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeCategory === cat 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                  : 'border-white/5 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredIngredients.map(ing => (
          <button
            key={ing.name}
            onClick={() => setSelectedIngredient(ing)}
            className="glass-card rounded-2xl border border-white/5 p-5 text-left flex flex-col justify-between gap-3 hover:scale-[1.02] transition-transform duration-150 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-sm block leading-tight">{ing.name}</span>
                {ing.e_number && (
                  <span className="text-[9px] font-bold bg-slate-950 px-2 py-0.5 border border-white/5 rounded text-slate-400">
                    {ing.e_number}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block mt-1">{ing.category.replace('_', ' ')}</span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
              {ing.what_is_it}
            </p>

            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                ing.is_harmful 
                  ? (ing.risk_level === 'very_high' || ing.risk_level === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {ing.is_harmful ? `${ing.risk_level?.toUpperCase()} RISK` : 'CLEAN'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold hover:underline">Learn More →</span>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredIngredients.length === 0 && (
        <div className="text-center py-16 text-slate-500 text-xs">
          No ingredients matched your filter choices.
        </div>
      )}

      {/* Ingredient Detail Modal Overlay (Slide sheet style) */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-card border border-white/10 rounded-2xl p-6 sm:p-8 animate-pop max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{selectedIngredient.category.replace('_', ' ')}</span>
                <h3 className="font-display font-black text-2xl text-white mt-1">{selectedIngredient.name}</h3>
                {selectedIngredient.aliases?.length > 0 && (
                  <span className="text-xs text-slate-400 block mt-1">Aliases: {selectedIngredient.aliases.join(', ')}</span>
                )}
              </div>
              <button 
                onClick={() => setSelectedIngredient(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-6 text-sm">
              {/* What is it */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">What is it?</span>
                <p className="text-slate-300 leading-relaxed font-medium">{selectedIngredient.what_is_it}</p>
              </div>

              {/* Health Risk explainer */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Health Risks & Body Impact</span>
                <p className="text-slate-300 leading-relaxed font-medium">{selectedIngredient.what_it_does_to_body}</p>
              </div>

              {/* Global Ban Status */}
              {selectedIngredient.is_harmful && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Safety Risk Level</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block ${
                      selectedIngredient.risk_level === 'very_high' || selectedIngredient.risk_level === 'high'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedIngredient.risk_level} Risk Additive
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Banned/Restricted In</span>
                    <span className="text-xs text-slate-300 font-bold block">
                      {selectedIngredient.banned_countries?.length ? selectedIngredient.banned_countries.join(', ') : 'Not globally banned'}
                    </span>
                  </div>
                </div>
              )}

              {/* Reverse Product Lookup list */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Products Containing This Ingredient</span>
                {reverseProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {reverseProducts.map((p, i) => (
                      <Link
                        key={i}
                        href={`/product/${p.barcode}`}
                        onClick={() => setSelectedIngredient(null)}
                        className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/25 rounded-xl flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-bold text-white block leading-tight">{p.name}</span>
                          <span className="text-[10px] text-slate-500">{p.brand}</span>
                        </div>
                        <span className={`font-bold ${p.health_score >= 7 ? 'text-emerald-400' : p.health_score >= 4.5 ? 'text-amber-400' : 'text-red-400'}`}>
                          {p.health_score}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 leading-normal">
                    No products in your local cabinet database contain this ingredient yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
