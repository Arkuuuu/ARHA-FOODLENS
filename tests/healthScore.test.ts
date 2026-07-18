import { calculateHealthScore } from '../lib/healthScore.ts';
import assert from 'assert';

console.log("=== Running ARHA-FoodLens Automated Unit Tests ===");

// Test Case 1: Ultra-processed snack (High sugar, high sodium, palm oil present)
const snackNutrition = {
  energy_kcal: 540,
  protein_g: 5.0,
  carbohydrates_g: 58.0,
  sugars_g: 22.0, // High sugar (>20g)
  added_sugars_g: 10.0,
  fat_g: 32.0,
  saturated_fat_g: 14.5,
  trans_fat_g: 0.1,
  sodium_mg: 950, // High sodium (>800mg)
  maida_percentage: 0,
  palm_oil_present: true // Palm oil present
};
const snackIngredients = [
  { name: "Potato", position: 1 },
  { name: "Refined Palm Oil", position: 2 },
  { name: "Sugar", position: 3 },
  { name: "Salt", position: 4 }
];

const snackScore = calculateHealthScore(snackNutrition, snackIngredients);
console.log(`Test 1 (Processed Snack) Health Score: ${snackScore}`);
assert.ok(snackScore <= 3.0, "Processed snack health score should be <= 3.0");

// Test Case 2: Clean whole-grain food (Low sugar, low sodium, millet based, no palm oil)
const cleanNutrition = {
  energy_kcal: 350,
  protein_g: 11.0,
  carbohydrates_g: 68.0,
  sugars_g: 1.0, // Low sugar
  added_sugars_g: 0,
  fat_g: 2.0,
  saturated_fat_g: 0.3,
  trans_fat_g: 0,
  sodium_mg: 120, // Low sodium
  maida_percentage: 0,
  palm_oil_present: false,
  fiber_g: 10.2 // High fiber (>5g)
};
const cleanIngredients = [
  { name: "Ragi Flour", position: 1 },
  { name: "Jowar Flour", position: 2 },
  { name: "Rock Salt", position: 3 }
];

const cleanScore = calculateHealthScore(cleanNutrition, cleanIngredients);
console.log(`Test 2 (Clean Millet Puff) Health Score: ${cleanScore}`);
assert.ok(cleanScore >= 7.0, "Clean millet food health score should be >= 7.0");

console.log("🟢 All health score unit tests passed successfully!");
