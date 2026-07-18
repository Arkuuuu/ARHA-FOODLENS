import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    console.log(`[API Search] Searching for: ${query}`);
    const results = await db.searchProducts(query);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("API Search route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
