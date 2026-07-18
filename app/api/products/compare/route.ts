import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { barcode1, barcode2 } = await req.json();

    if (!barcode1 || !barcode2) {
      return NextResponse.json({ error: 'Both barcodes are required' }, { status: 400 });
    }

    console.log(`[API Compare] Comparing ${barcode1} vs ${barcode2}`);
    const product1 = await db.getProductByBarcode(barcode1);
    const product2 = await db.getProductByBarcode(barcode2);

    if (!product1 || !product2) {
      return NextResponse.json({ error: 'One or both products could not be retrieved' }, { status: 404 });
    }

    return NextResponse.json({ product1, product2 });
  } catch (err: any) {
    console.error("API Compare route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
