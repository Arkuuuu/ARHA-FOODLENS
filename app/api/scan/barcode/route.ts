import { NextResponse } from 'next/server';
import { db, Product } from '@/lib/db';
import { calculateHealthScore } from '@/lib/healthScore';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { barcode, customData } = body;

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    // A. Handle custom AI OCR product creation
    if (customData) {
      console.log(`[API Barcode] Creating custom product from OCR data: ${barcode}`);
      const score = calculateHealthScore(customData.nutrition, customData.ingredients);
      const newProduct: Product = {
        id: barcode,
        barcode,
        name: customData.name || 'AI Scanned Product',
        brand: customData.brand || 'Generic',
        category: customData.category || 'Packaged Foods',
        subcategory: customData.subcategory || 'General',
        image_url: customData.image_url || '',
        label_image_url: customData.label_image_url || '',
        serving_size_g: parseFloat(customData.serving_size_g || '30'),
        actual_serving_size_g: parseFloat(customData.serving_size_g || '30') * 1.5,
        pack_size_g: parseFloat(customData.pack_size_g || '100'),
        is_vegetarian: customData.is_vegetarian !== false,
        is_vegan: customData.is_vegan || false,
        is_gluten_free: !customData.ingredients.some((i: any) => i.allergen_type === 'gluten'),
        health_score: score,
        fssai_license: '',
        manufacturer: '',
        country_of_origin: 'India',
        verified: false,
        data_source: 'community'
      };
      
      const savedProduct = await db.upsertProduct(newProduct, customData.nutrition, customData.ingredients);
      return NextResponse.json({
        ...(savedProduct || newProduct),
        nutrition: customData.nutrition,
        ingredients: customData.ingredients,
        alternatives: []
      });
    }

    // 1. Check database first
    const product = await db.getProductByBarcode(barcode);
    if (product) {
      console.log(`[API Barcode] Found product in database: ${product.name}`);
      return NextResponse.json(product);
    }

    // 2. Fetch from Open Food Facts API (Fallback)
    console.log(`[API Barcode] Product not in database. Fetching from Open Food Facts: ${barcode}`);
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const offRes = await fetch(offUrl, {
      headers: {
        'User-Agent': 'ARHA-FoodLens - Web - Version 1.0'
      }
    });

    if (!offRes.ok) {
      return NextResponse.json({ error: 'Product not found and API request failed' }, { status: 404 });
    }

    const offData = await offRes.json();
    if (offData.status === 0 || !offData.product) {
      return NextResponse.json({ error: 'Product not found in Open Food Facts' }, { status: 404 });
    }

    const offProduct = offData.product;

    // 3. Map Open Food Facts fields to our schema
    const nutriments = offProduct.nutriments || {};
    const ingredientsText = offProduct.ingredients_text || '';
    
    // Parse ingredients from text
    // E.g. "Wheat flour, Palm oil, Salt, Tartrazine (E102), TBHQ"
    const rawIngs = ingredientsText.split(/,|\(|\)/).map((i: string) => i.trim()).filter((i: string) => i.length > 1);
    
    const palmOilWords = ['palm oil', 'palmolein', 'palm kernel oil'];
    const maidaWords = ['refined wheat flour', 'maida', 'all purpose flour', 'refined flour'];
    
    let palmOilPresent = false;
    let estimatedMaida = 0;

    const parsedIngredients = rawIngs.map((name: string, index: number) => {
      const lowerName = name.toLowerCase();
      
      // Check for Palm Oil
      if (palmOilWords.some(w => lowerName.includes(w))) {
        palmOilPresent = true;
      }
      // Check for Maida
      if (maidaWords.some(w => lowerName.includes(w))) {
        estimatedMaida = 80; // Default estimate if maida is present
      }

      // Detect E-Numbers (e.g. E102, E319, INS 102)
      let e_number: string | undefined = undefined;
      const eMatch = name.match(/E\s*(\d{3,4})[a-z]?/i);
      const insMatch = name.match(/INS\s*(\d{3,4})[a-z]?/i);
      if (eMatch) {
        e_number = `E${eMatch[1]}`;
      } else if (insMatch) {
        e_number = `E${insMatch[1]}`;
      }

      // Check if allergen
      const allergenWords = {
        gluten: ['wheat', 'gluten', 'barley', 'rye', 'malt'],
        dairy: ['milk', 'whey', 'casein', 'lactose', 'butter', 'cheese'],
        nuts: ['almond', 'cashew', 'walnut', 'pistachio', 'nut'],
        soy: ['soy', 'soya', 'lecithin'],
        eggs: ['egg', 'albumin']
      };

      let is_allergen = false;
      let allergen_type: string | undefined = undefined;

      for (const [type, words] of Object.entries(allergenWords)) {
        if (words.some(w => lowerName.includes(w))) {
          is_allergen = true;
          allergen_type = type;
          break;
        }
      }

      return {
        name,
        e_number,
        position: index + 1,
        is_allergen,
        allergen_type
      };
    });

    const nutrition = {
      energy_kcal: parseFloat(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
      protein_g: parseFloat(nutriments.proteins_100g || 0),
      carbohydrates_g: parseFloat(nutriments.carbohydrates_100g || 0),
      sugars_g: parseFloat(nutriments.sugars_100g || 0),
      added_sugars_g: parseFloat(nutriments['added-sugars_100g'] || 0),
      fat_g: parseFloat(nutriments.fat_100g || 0),
      saturated_fat_g: parseFloat(nutriments['saturated-fat_100g'] || 0),
      trans_fat_g: parseFloat(nutriments['trans-fat_100g'] || 0),
      fiber_g: parseFloat(nutriments.fiber_100g || 0),
      sodium_mg: parseFloat(nutriments.sodium_100g || 0) * 1000, // Convert g to mg
      maida_percentage: estimatedMaida,
      palm_oil_present: palmOilPresent || offProduct.ingredients_tags?.includes('en:palm-oil'),
      glycemic_index_estimate: estimatedMaida > 0 ? 70 : (nutriments.sugars_100g > 15 ? 65 : 52)
    };

    // Calculate Health Score
    const score = calculateHealthScore(nutrition, parsedIngredients);

    const newProduct: Product = {
      id: barcode,
      barcode,
      name: offProduct.product_name || 'Unknown Product',
      brand: offProduct.brands || 'Unknown Brand',
      category: offProduct.categories?.split(',')[0] || 'Packaged Foods',
      subcategory: offProduct.categories_tags?.[0]?.replace('en:', '') || 'General',
      image_url: offProduct.image_front_url || '',
      label_image_url: offProduct.image_ingredients_url || '',
      serving_size_g: parseFloat(offProduct.serving_size?.match(/\d+/)?.[0] || '30'),
      actual_serving_size_g: parseFloat(offProduct.serving_size?.match(/\d+/)?.[0] || '30') * 1.5,
      pack_size_g: parseFloat(offProduct.product_quantity || '100'),
      is_vegetarian: !offProduct.ingredients_analysis_tags?.includes('en:non-vegetarian'),
      is_vegan: offProduct.ingredients_analysis_tags?.includes('en:vegan'),
      is_gluten_free: !parsedIngredients.some((i: any) => i.allergen_type === 'gluten'),
      health_score: score,
      fssai_license: '',
      manufacturer: '',
      country_of_origin: offProduct.countries || 'India',
      verified: false,
      data_source: 'open_food_facts'
    };

    // Save to database
    const savedProduct = await db.upsertProduct(newProduct, nutrition, parsedIngredients);
    const resultProduct = savedProduct || newProduct;

    return NextResponse.json({
      ...resultProduct,
      nutrition,
      ingredients: parsedIngredients,
      alternatives: []
    });
  } catch (err: any) {
    console.error("API Barcode scan route error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
