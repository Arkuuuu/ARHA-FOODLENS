import { NextResponse } from 'next/server';
import { gemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { product, profile } = await req.json();

    if (!product || !profile) {
      return NextResponse.json({ error: 'Product and profile are required' }, { status: 400 });
    }

    console.log(`[API Verdict] Generating verdict for product: ${product.name} with profile: ${profile.name}`);
    const verdict = await gemini.generateVerdict(product, profile);
    
    return NextResponse.json(verdict);
  } catch (err: any) {
    console.error("API Verdict route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
