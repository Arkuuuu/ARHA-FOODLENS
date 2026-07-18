import { NextResponse } from 'next/server';
import { gemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data (base64) is required' }, { status: 400 });
    }

    console.log(`[API OCR] Initiating Gemini label scan... (isMock: ${gemini.isMock})`);
    const extractedData = await gemini.extractLabelNutrition(image);
    
    return NextResponse.json(extractedData);
  } catch (err: any) {
    console.error("API OCR route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
