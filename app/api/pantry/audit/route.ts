import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { barcodes } = await req.json();

    if (!barcodes || !Array.isArray(barcodes) || barcodes.length === 0) {
      return NextResponse.json({ error: 'Barcodes array is required' }, { status: 400 });
    }

    console.log(`[API Pantry Audit] Auditing pantry with ${barcodes.length} items`);
    const products = [];
    for (const barcode of barcodes) {
      const p = await db.getProductByBarcode(barcode);
      if (p) products.push(p);
    }

    if (products.length === 0) {
      return NextResponse.json({
        pantryScore: 10.0,
        totalProducts: 0,
        harmfulSubstancesCount: 0,
        worstOffenders: [],
        healthySwaps: [],
        message: 'No products in your pantry yet!'
      });
    }

    // Calculate metrics
    const totalScore = products.reduce((acc, p) => acc + (p.health_score || 5.0), 0);
    const pantryScore = Math.round((totalScore / products.length) * 10) / 10;

    const worstOffenders = products.filter(p => (p.health_score || 5.0) < 5.0);

    // Extract unique harmful substances
    const substancesFound = new Set<string>();
    products.forEach(p => {
      p.ingredients?.forEach((ing: any) => {
        if (ing.substance_id || ing.e_number) {
          substancesFound.add(ing.name);
        }
      });
    });

    // Healthy swaps mapping
    const healthySwaps = [];
    const seedData = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'data/seed_data.json'), 'utf-8')
    );
    const allSeedProducts = seedData.seedProducts || [];

    for (const offender of worstOffenders) {
      // Find direct mapped alternative first
      if (offender.alternatives && offender.alternatives.length > 0) {
        const alt = offender.alternatives[0];
        healthySwaps.push({
          originalProduct: offender.name,
          originalBarcode: offender.barcode,
          originalScore: offender.health_score,
          swapProduct: alt.name || alt.alternative_barcode,
          swapBarcode: alt.alternative_barcode,
          swapScore: alt.health_score || 8.0,
          reason: alt.reason
        });
      } else {
        // Find general category replacement from database
        const match = allSeedProducts.find(
          (p: any) => p.category === offender.category && p.health_score > 6.0
        );
        if (match) {
          healthySwaps.push({
            originalProduct: offender.name,
            originalBarcode: offender.barcode,
            originalScore: offender.health_score,
            swapProduct: match.name,
            swapBarcode: match.barcode,
            swapScore: match.health_score,
            reason: `Baked or air-puffed whole grains; contains zero palm oil and far lower sodium than ${offender.name}.`
          });
        }
      }
    }

    return NextResponse.json({
      pantryScore,
      totalProducts: products.length,
      harmfulSubstancesCount: substancesFound.size,
      worstOffenders,
      healthySwaps
    });
  } catch (err: any) {
    console.error("API Pantry Audit route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';
