import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const profilePath = path.resolve(process.cwd(), 'data/mock_user_profile.json');

const defaultProfile = {
  name: "Arka",
  age: 28,
  gender: "male",
  weight_kg: 78,
  height_cm: 175,
  activity_level: "sedentary",
  conditions: ["diabetes"], // prediabetes, hypertension
  allergies: ["lactose"],
  dietary_type: "vegetarian",
  goal: "control_sugar",
  medications: ["metformin"],
  is_pregnant: false,
  pregnancy_week: 0,
  profile_mode: "adult",
  daily_calorie_target: 1950,
  daily_sodium_limit_mg: 1500,
  daily_sugar_limit_g: 20
};

function getProfile() {
  try {
    if (fs.existsSync(profilePath)) {
      return JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    }
  } catch (e) {
    console.error(e);
  }
  return defaultProfile;
}

export async function GET() {
  const profile = getProfile();
  return NextResponse.json(profile);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const current = getProfile();
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    
    // Auto-calculate daily targets based on health profile conditions
    let sodium = 2000;
    let sugar = 25;
    let calories = 2000;

    if (updated.conditions?.includes('hypertension')) sodium = 1500;
    if (updated.conditions?.includes('diabetes') || updated.conditions?.includes('prediabetes')) sugar = 20;
    if (updated.goal === 'weight_loss') calories = 1600;
    else if (updated.goal === 'muscle_gain') calories = 2400;

    updated.daily_sodium_limit_mg = sodium;
    updated.daily_sugar_limit_g = sugar;
    updated.daily_calorie_target = calories;

    fs.writeFileSync(profilePath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("API Profile route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
