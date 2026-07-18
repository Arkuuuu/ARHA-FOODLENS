'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image_url?: string;
  health_score: number;
  is_vegetarian: boolean;
  nutrition: {
    energy_kcal: number;
    sugars_g: number;
    sodium_mg: number;
    protein_g: number;
  };
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeScoreFilter, setActiveScoreFilter] = useState('all'); // all, safe, caution, risk

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products/search?q=all');
        if (res.ok) {
          setProducts(await res.json());
        }
      } catch (err) {
        console.error("Failed to load products list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchesCategory = 
      activeCategory === 'all' || 
      p.category.toLowerCase().includes(activeCategory.toLowerCase());

    let matchesScore = true;
    if (activeScoreFilter === 'safe') matchesScore = p.health_score >= 7.0;
    else if (activeScoreFilter === 'caution') matchesScore = p.health_score >= 4.5 && p.health_score < 7.0;
    else if (activeScoreFilter === 'risk') matchesScore = p.health_score < 4.5;

    return matchesSearch && matchesCategory && matchesScore;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-1/3 bg-slate-900 rounded-xl"></div>
        <div className="h-10 w-full bg-slate-900 rounded-xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div className="h-48 bg-slate-900 rounded-2xl"></div>
          <div className="h-48 bg-slate-900 rounded-2xl"></div>
          <div className="h-48 bg-slate-900 rounded-2xl"></div>
          <div className="h-48 bg-slate-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">🛍️ Food Product Catalogue</h1>
          <p className="text-slate-400 text-xs mt-1">Explore all packaged products in our health catalog with exact packaging details.</p>
        </div>
        <Link href="/scan" className="px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg self-start sm:self-auto">
          📷 Add New by Scanning
        </Link>
      </div>

      {/* Filters block */}
      <div className="flex flex-col gap-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search products by brand, name, or barcode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {/* Score rating filter */}
          <div className="flex bg-slate-950 p-1 border border-white/5 rounded-xl gap-1">
            {['all', 'safe', 'caution', 'risk'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveScoreFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeScoreFilter === filter
                    ? (filter === 'safe' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : filter === 'caution' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : filter === 'risk' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-white')
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Category lists */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
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

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(p => (
          <Link
            key={p.barcode}
            href={`/product/${p.barcode}`}
            className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-transform duration-150 group"
          >
            {/* Exact Packaging Image Container */}
            <div className="w-full aspect-square bg-slate-950/60 relative flex items-center justify-center border-b border-white/5 p-4 overflow-hidden">
              {p.image_url ? (
                <img 
                  src={p.image_url} 
                  alt={p.name} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              ) : (
                <span className="text-4xl">🍿</span>
              )}
              {/* Health Score Pill */}
              <span className={`absolute top-3 right-3 font-display font-black text-xs px-2.5 py-1 rounded-lg border shadow-lg ${
                p.health_score >= 7.0 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : p.health_score >= 4.5 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                ★ {p.health_score}
              </span>
              
              {/* Veg Dot */}
              <span className="absolute bottom-3 left-3 flex items-center justify-center bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${p.is_vegetarian ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
              </span>
            </div>

            {/* Product Meta */}
            <div className="p-4.5 flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{p.brand}</span>
                <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors mt-0.5">{p.name}</h3>
              </div>

              {/* Core Nutrition Stats */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-[10px] text-slate-400">
                <div>
                  <span className="block text-slate-500">Sugars</span>
                  <span className="font-bold text-slate-200">{p.nutrition?.sugars_g ?? 0}g / 100g</span>
                </div>
                <div>
                  <span className="block text-slate-500">Sodium</span>
                  <span className="font-bold text-slate-200">{p.nutrition?.sodium_mg ?? 0}mg</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                <span>Code: {p.barcode}</span>
                <span className="text-emerald-400 group-hover:underline">Analyze Pack →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-slate-500 text-xs">
          No food products matched your search queries. Try adding it by scanning!
        </div>
      )}
    </div>
  );
}
