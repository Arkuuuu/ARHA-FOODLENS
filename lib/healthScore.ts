import fs from 'fs';
import path from 'path';

// Helper to load local substances map for mapping raw OFF ingredients to harmful substances
function getHarmfulSubstancesList() {
  try {
    const jsonPath = path.resolve(process.cwd(), 'data/seed_data.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      return data.harmfulSubstances || [];
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

// Function to calculate India-calibrated Health Score
export function calculateHealthScore(nutrition: any, ingredients: any[]): number {
  let score = 6.0;

  // 1. Penalize Sugar (per 100g)
  const sugar = nutrition.sugars_g || 0;
  if (sugar > 20) score -= 2.0;
  else if (sugar > 10) score -= 1.0;
  else if (sugar > 5) score -= 0.5;

  // 2. Penalize Sodium (per 100g)
  const sodium = nutrition.sodium_mg || 0;
  if (sodium > 800) score -= 2.0; // Over 800mg/100g (e.g. instant noodles)
  else if (sodium > 400) score -= 1.0;
  else if (sodium > 150) score -= 0.5;

  // 3. Penalize Palm Oil
  if (nutrition.palm_oil_present) {
    score -= 1.5;
  }

  // 4. Penalize Maida (Refined Wheat Flour)
  const maida = nutrition.maida_percentage || 0;
  if (maida > 50) score -= 1.5;
  else if (maida > 10) score -= 0.75;

  // 5. Penalize Saturated Fat
  const satFat = nutrition.saturated_fat_g || 0;
  if (satFat > 10) score -= 1.0;
  else if (satFat > 5) score -= 0.5;

  // 6. Penalize Trans Fat
  if (nutrition.trans_fat_g > 0.1) {
    score -= 1.0;
  }

  // 7. Boost for Protein and Fiber
  const protein = nutrition.protein_g || 0;
  if (protein > 10) score += 0.5;
  const fiber = nutrition.fiber_g || 0;
  if (fiber > 5) score += 0.75;

  // 8. Deduct for Harmful Substances
  const substances = getHarmfulSubstancesList();
  for (const ing of ingredients) {
    const isHarmful = substances.find(
      (s: any) => 
        (ing.e_number && s.e_number === ing.e_number) ||
        s.name.toLowerCase() === ing.name.toLowerCase()
    );
    if (isHarmful) {
      if (isHarmful.risk_level === 'very_high') score -= 1.5;
      else if (isHarmful.risk_level === 'high') score -= 1.0;
      else if (isHarmful.risk_level === 'medium') score -= 0.5;
    }
  }

  // Round and clamp between 0.5 and 10
  return Math.max(0.5, Math.min(10.0, Math.round(score * 10) / 10));
}
