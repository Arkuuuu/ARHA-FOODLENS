import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isMockMode = 
  !supabaseUrl || 
  supabaseUrl.includes('your-project-id') || 
  !supabaseAnonKey || 
  supabaseAnonKey.includes('your-anon-key');

// Initialize supabase client if not in mock mode
export const supabase = !isMockMode ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Helper to load seed data locally
function getLocalSeedData() {
  try {
    // Determine path dynamically based on runtime context (dev/build/serverless)
    const jsonPath = path.resolve(process.cwd(), 'data/seed_data.json');
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading local seed data:", err);
  }
  return { harmfulSubstances: [], encyclopediaIngredients: [], seedProducts: [] };
}

// Interfaces
export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image_url?: string;
  label_image_url?: string;
  serving_size_g: number;
  actual_serving_size_g: number;
  pack_size_g: number;
  is_vegetarian: boolean;
  is_vegan?: boolean;
  is_jain?: boolean;
  is_halal?: boolean;
  is_gluten_free?: boolean;
  health_score: number;
  fssai_license?: string;
  manufacturer?: string;
  country_of_origin?: string;
  verified: boolean;
  data_source: string;
  nutrition?: any;
  ingredients?: any[];
  alternatives?: any[];
}

export interface HarmfulSubstance {
  id: string;
  name: string;
  e_number?: string;
  ins_number?: string;
  category: string;
  risk_level: string;
  risk_summary: string;
  cancer_risk: boolean;
  cancer_evidence_level?: string;
  endocrine_disruptor: boolean;
  hyperactivity_risk: boolean;
  unsafe_in_pregnancy: boolean;
  unsafe_for_children: boolean;
  kidney_risk: boolean;
  liver_risk: boolean;
  thyroid_risk: boolean;
  status_india: string;
  banned_countries: string[];
  restricted_countries: string[];
  who_status?: string;
  fssai_adi?: string;
  sources: string[];
  plain_english_explainer: string;
  safer_alternative?: string;
}

// Database Actions Wrapper
export const db = {
  isMock: isMockMode,

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    if (isMockMode || !supabase) {
      console.log(`[DB Mock Mode] Querying product for barcode: ${barcode}`);
      const data = getLocalSeedData();
      const product = data.seedProducts.find((p: any) => p.barcode === barcode);
      if (!product) return null;
      
      // Inject standard UUID if not present
      return {
        id: product.barcode,
        ...product
      } as Product;
    }

    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          nutrition (*),
          ingredients (*)
        `)
        .eq('barcode', barcode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Query alternatives
      const { data: alts } = await supabase
        .from('product_alternatives')
        .select(`
          alternative_product_id,
          reason,
          products:alternative_product_id (*)
        `)
        .eq('product_id', product.id);

      return {
        ...product,
        alternatives: alts?.map((a: any) => ({
          alternative_barcode: a.products?.barcode,
          reason: a.reason,
          ...a.products
        })) || []
      } as Product;
    } catch (err) {
      console.error("Supabase getProductByBarcode error:", err);
      return null;
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    if (isMockMode || !supabase) {
      console.log(`[DB Mock Mode] Searching products for query: ${query}`);
      const data = getLocalSeedData();
      const term = query.toLowerCase();
      const products = data.seedProducts.filter(
        (p: any) => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
      );
      return products.map((p: any) => ({ id: p.barcode, ...p }));
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          nutrition (*)
        `)
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Supabase searchProducts error:", err);
      return [];
    }
  },

  async getHarmfulSubstances(): Promise<HarmfulSubstance[]> {
    if (isMockMode || !supabase) {
      const data = getLocalSeedData();
      return data.harmfulSubstances as HarmfulSubstance[];
    }

    try {
      const { data, error } = await supabase
        .from('harmful_substances')
        .select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Supabase getHarmfulSubstances error:", err);
      return [];
    }
  },

  async getEncyclopediaIngredients(): Promise<any[]> {
    if (isMockMode || !supabase) {
      const data = getLocalSeedData();
      return data.encyclopediaIngredients;
    }

    try {
      const { data, error } = await supabase
        .from('ingredient_encyclopedia')
        .select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Supabase getEncyclopediaIngredients error:", err);
      return [];
    }
  },

  async upsertProduct(product: Product, nutrition: any, ingredients: any[]): Promise<Product | null> {
    if (isMockMode || !supabase) {
      console.log(`[DB Mock Mode] Mock upsert product: ${product.name}`);
      const data = getLocalSeedData();
      
      const existingIdx = data.seedProducts.findIndex((p: any) => p.barcode === product.barcode);
      const enrichedProd = { ...product, nutrition, ingredients, alternatives: [] };
      
      if (existingIdx >= 0) {
        data.seedProducts[existingIdx] = enrichedProd;
      } else {
        data.seedProducts.push(enrichedProd);
      }

      const jsonPath = path.resolve(process.cwd(), 'data/seed_data.json');
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
      return enrichedProd;
    }

    try {
      // 1. Insert product
      const { data: pData, error: pError } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'barcode' })
        .select()
        .single();
      
      if (pError) throw pError;
      const pId = pData.id;

      // 2. Insert nutrition
      const { error: nError } = await supabase
        .from('nutrition')
        .upsert({ ...nutrition, product_id: pId }, { onConflict: 'product_id' });
      if (nError) throw nError;

      // 3. Clear and insert ingredients
      await supabase.from('ingredients').delete().eq('product_id', pId);
      for (const ing of ingredients) {
        // Look up substance ID mapping
        let substanceId = null;
        if (ing.e_number) {
          const { data: sData } = await supabase
            .from('harmful_substances')
            .select('id')
            .eq('e_number', ing.e_number)
            .single();
          if (sData) substanceId = sData.id;
        }

        await supabase.from('ingredients').insert({
          product_id: pId,
          ingredient_name: ing.name || ing.ingredient_name,
          e_number: ing.e_number || null,
          position: ing.position,
          is_allergen: ing.is_allergen || false,
          allergen_type: ing.allergen_type || null,
          substance_id: substanceId
        });
      }

      return pData;
    } catch (err) {
      console.error("Supabase upsertProduct error:", err);
      return null;
    }
  }
};
