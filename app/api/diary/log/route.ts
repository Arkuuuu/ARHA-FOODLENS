import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

const diaryPath = path.resolve(process.cwd(), 'data/mock_food_diary.json');

// Default initial log to show visual progress immediately
const defaultLogs = [
  {
    id: "log-1",
    product_id: "8901725181223", // Kurkure
    product_name: "Kurkure Masala Munch",
    brand: "PepsiCo India",
    meal_type: "snack",
    quantity_g: 30,
    consumed_at: new Date().toISOString().split('T')[0],
    calories_consumed: 167,
    sodium_consumed_mg: 267,
    sugar_consumed_g: 0.5,
    harmful_substances_consumed: ["Tartrazine"]
  }
];

function getDiaryLogs() {
  try {
    if (fs.existsSync(diaryPath)) {
      return JSON.parse(fs.readFileSync(diaryPath, 'utf-8'));
    }
  } catch (e) {
    console.error(e);
  }
  return defaultLogs;
}

export async function GET() {
  const logs = getDiaryLogs();
  const today = new Date().toISOString().split('T')[0];
  
  // Filter for today
  const todayLogs = logs.filter((log: any) => log.consumed_at === today);
  
  // Calculate today's totals
  const totals = todayLogs.reduce((acc: any, log: any) => {
    acc.calories += log.calories_consumed || 0;
    acc.sodium += log.sodium_consumed_mg || 0;
    acc.sugar += log.sugar_consumed_g || 0;
    return acc;
  }, { calories: 0, sodium: 0, sugar: 0 });

  return NextResponse.json({
    logs: todayLogs,
    totals
  });
}

export async function POST(req: Request) {
  try {
    const { product_id, meal_type, quantity_g } = await req.json();

    if (!product_id || !meal_type || !quantity_g) {
      return NextResponse.json({ error: 'product_id, meal_type, and quantity_g are required' }, { status: 400 });
    }

    const product = await db.getProductByBarcode(product_id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const nutrition = product.nutrition || {};
    const ratio = quantity_g / 100;

    const calories_consumed = Math.round((nutrition.energy_kcal || 0) * ratio);
    const sodium_consumed_mg = Math.round((nutrition.sodium_mg || 0) * ratio);
    const sugar_consumed_g = Math.round((nutrition.sugars_g || 0) * ratio * 10) / 10;

    // Detect harmful substances consumed
    const harmful_substances_consumed: string[] = [];
    product.ingredients?.forEach((ing: any) => {
      if (ing.substance_id || ing.e_number) {
        harmful_substances_consumed.push(ing.name);
      }
    });

    const logs = getDiaryLogs();
    const newLog = {
      id: `log-${Date.now()}`,
      product_id,
      product_name: product.name,
      brand: product.brand,
      meal_type,
      quantity_g,
      consumed_at: new Date().toISOString().split('T')[0],
      calories_consumed,
      sodium_consumed_mg,
      sugar_consumed_g,
      harmful_substances_consumed
    };

    logs.push(newLog);
    fs.writeFileSync(diaryPath, JSON.stringify(logs, null, 2), 'utf-8');

    return NextResponse.json(newLog);
  } catch (err: any) {
    console.error("API Diary Log route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
