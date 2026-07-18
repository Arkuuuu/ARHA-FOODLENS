import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const jsonPath = path.resolve(process.cwd(), 'data/seed_data.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'Seed data not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);

    const harmful = data.harmfulSubstances || [];
    const regular = data.encyclopediaIngredients || [];

    // Map harmful substances to matching structure
    const mappedHarmful = harmful.map((h: any) => ({
      name: h.name,
      aliases: h.e_number ? [h.e_number] : [],
      e_number: h.e_number,
      category: h.category || 'additive',
      what_is_it: h.plain_english_explainer || 'Synthetic chemical additive.',
      what_it_does_to_body: h.risk_summary || 'Ingestion may trigger adverse metabolic or physical sensitivities.',
      found_in_products: h.category === 'artificial_color' ? ['Beverages', 'Candies', 'Sauces'] : ['Chips', 'Noodles', 'Bakery'],
      is_harmful: true,
      risk_level: h.risk_level,
      banned_countries: h.banned_countries
    }));

    const mappedRegular = regular.map((r: any) => ({
      name: r.name,
      aliases: r.aliases || [],
      e_number: r.e_number || null,
      category: r.category || 'ingredient',
      what_is_it: r.what_is_it || 'Common food ingredient.',
      what_it_does_to_body: r.what_it_does_to_body || 'Nutrient metabolizer.',
      found_in_products: r.found_in_products || [],
      is_harmful: r.is_harmful || false,
      risk_level: r.is_harmful ? 'medium' : 'low',
      banned_countries: []
    }));

    const allIngredients = [...mappedHarmful, ...mappedRegular];

    return NextResponse.json(allIngredients);
  } catch (err: any) {
    console.error("API Substances Search error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
