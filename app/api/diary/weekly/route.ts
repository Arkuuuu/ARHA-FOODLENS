import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const diaryPath = path.resolve(process.cwd(), 'data/mock_food_diary.json');

function getDiaryLogs() {
  try {
    if (fs.existsSync(diaryPath)) {
      return JSON.parse(fs.readFileSync(diaryPath, 'utf-8'));
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function GET() {
  const logs = getDiaryLogs();
  
  // Calculate date range (last 7 days inclusive)
  const dailyBreakdown: any[] = [];
  const chemicalExposures: Record<string, number> = {};
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Filter logs for this day
    const dayLogs = logs.filter((log: any) => log.consumed_at === dateStr);
    
    let calories = 0;
    let sodium = 0;
    let sugar = 0;
    let harmfulCount = 0;

    dayLogs.forEach((log: any) => {
      calories += log.calories_consumed || 0;
      sodium += log.sodium_consumed_mg || 0;
      sugar += log.sugar_consumed_g || 0;
      
      log.harmful_substances_consumed?.forEach((sub: string) => {
        harmfulCount++;
        chemicalExposures[sub] = (chemicalExposures[sub] || 0) + 1;
      });
    });

    dailyBreakdown.push({
      date: dateStr,
      day: dayName,
      calories,
      sodium,
      sugar,
      harmfulCount
    });
  }

  // Map chemical exposures list
  const chemicalList = Object.entries(chemicalExposures).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);

  // Map worst offenders from logs
  const itemCounts: Record<string, { count: number; name: string; brand: string }> = {};
  logs.forEach((log: any) => {
    itemCounts[log.product_name] = {
      count: (itemCounts[log.product_name]?.count || 0) + 1,
      name: log.product_name,
      brand: log.brand
    };
  });

  const topLogs = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return NextResponse.json({
    dailyBreakdown,
    chemicalExposures: chemicalList,
    topLogs
  });
}
