const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 1. HARMFUL SUBSTANCES DATA
const harmfulSubstances = [
  // Artificial Colors
  {
    name: "Tartrazine",
    e_number: "E102",
    ins_number: "102",
    category: "artificial_color",
    risk_level: "high",
    risk_summary: "Hyperactivity in children, asthma, and potential carcinogenic links.",
    cancer_risk: true,
    cancer_evidence_level: "IARC Group 3",
    hyperactivity_risk: true,
    unsafe_in_pregnancy: true,
    unsafe_for_children: true,
    status_india: "permitted",
    banned_countries: ["Norway", "Austria"],
    plain_english_explainer: "A bright yellow synthetic dye. Banned in Norway and Austria due to its links to hyperactivity in kids and allergic reactions like asthma.",
    safer_alternative: "Turmeric extract (Curcumin) or Beta-carotene"
  },
  {
    name: "Sunset Yellow FCF",
    e_number: "E110",
    ins_number: "110",
    category: "artificial_color",
    risk_level: "high",
    risk_summary: "Linked to hyperactivity, allergies, and thyroid tumors in animal studies.",
    cancer_risk: false,
    hyperactivity_risk: true,
    unsafe_in_pregnancy: true,
    unsafe_for_children: true,
    status_india: "permitted",
    banned_countries: ["Finland", "Norway"],
    plain_english_explainer: "An orange-red dye that can trigger hyperactivity in kids and worsen asthma. Restructured or banned in Scandinavia.",
    safer_alternative: "Paprika extract or Annatto"
  },
  {
    name: "Carmoisine",
    e_number: "E122",
    ins_number: "122",
    category: "artificial_color",
    risk_level: "high",
    risk_summary: "Hyperactivity in children, allergen, banned in multiple countries.",
    cancer_risk: false,
    hyperactivity_risk: true,
    unsafe_for_children: true,
    status_india: "permitted",
    banned_countries: ["USA", "Japan", "Norway", "Sweden"],
    plain_english_explainer: "A red food color. Strictly banned in the US and Japan because of hyperactivity concerns and potential allergic flare-ups.",
    safer_alternative: "Beetroot red or Anthocyanins"
  },
  {
    name: "Amaranth",
    e_number: "E123",
    ins_number: "123",
    category: "artificial_color",
    risk_level: "very_high",
    risk_summary: "Linked to cancer and birth defects; banned for food in the USA since 1976.",
    cancer_risk: true,
    cancer_evidence_level: "IARC Group 2B",
    unsafe_in_pregnancy: true,
    unsafe_for_children: true,
    status_india: "restricted",
    banned_countries: ["USA", "Russia", "Zimbabwe"],
    plain_english_explainer: "A dark red dye banned in the US for decades after animal studies linked it to malignant tumors.",
    safer_alternative: "Red cabbage extract"
  },
  {
    name: "Ponceau 4R",
    e_number: "E124",
    ins_number: "124",
    category: "artificial_color",
    risk_level: "high",
    risk_summary: "Hyperactivity, potential carcinogen, and kidney damage risk.",
    cancer_risk: true,
    kidney_risk: true,
    hyperactivity_risk: true,
    unsafe_for_children: true,
    status_india: "permitted",
    banned_countries: ["USA", "Norway"],
    plain_english_explainer: "A strawberry red coal-tar dye. Banned in the US due to concerns over cancer and behavioral issues in kids.",
    safer_alternative: "Beetroot extract"
  },
  {
    name: "Erythrosine",
    e_number: "E127",
    ins_number: "127",
    category: "artificial_color",
    risk_level: "high",
    risk_summary: "Thyroid disruption, chromosomal damage, and carcinogen in high doses.",
    cancer_risk: true,
    thyroid_risk: true,
    unsafe_for_children: true,
    status_india: "restricted",
    banned_countries: ["EU (food use)", "Norway"],
    plain_english_explainer: "A cherry-pink color that contains iodine. Banned in Europe for general food items as it interferes with thyroid function and can cause DNA damage.",
    safer_alternative: "Carmine or Lycopene"
  },
  // Preservatives
  {
    name: "TBHQ",
    e_number: "E319",
    ins_number: "319",
    category: "preservative",
    risk_level: "high",
    risk_summary: "Carcinogenic at high doses, immune disruption, DNA damage, and vision disturbance.",
    cancer_risk: true,
    liver_risk: true,
    unsafe_in_pregnancy: true,
    status_india: "permitted",
    banned_countries: ["Japan"],
    plain_english_explainer: "Tertiary Butylhydroquinone is a synthetic antioxidant used to prevent rancidity in fats. It is banned in Japan because long-term studies linked high doses to stomach tumors.",
    safer_alternative: "Tocopherols (Vitamin E) or Rosemary extract"
  },
  {
    name: "BHA",
    e_number: "E320",
    ins_number: "320",
    category: "preservative",
    risk_level: "high",
    risk_summary: "IARC Group 2B probable carcinogen, endocrine disruptor.",
    cancer_risk: true,
    cancer_evidence_level: "IARC Group 2B",
    endocrine_disruptor: true,
    status_india: "permitted",
    banned_countries: ["Japan", "EU (restricted)"],
    plain_english_explainer: "Butylated Hydroxyanisole is a waxy chemical used to preserve fats. The WHO classifies it as a suspected carcinogen and hormone disruptor.",
    safer_alternative: "Rosemary extract"
  },
  {
    name: "BHT",
    e_number: "E321",
    ins_number: "321",
    category: "preservative",
    risk_level: "high",
    risk_summary: "Endocrine disruptor, lung tumor risk in animals, skin sensitizer.",
    cancer_risk: true,
    endocrine_disruptor: true,
    status_india: "permitted",
    banned_countries: ["UK", "Romania", "Sweden"],
    plain_english_explainer: "Butylated Hydroxytoluene is similar to BHA. It can mimic estrogen, disrupting hormones, and is restricted in many European countries.",
    safer_alternative: "Mixed Tocopherols"
  },
  {
    name: "Sodium Benzoate",
    e_number: "E211",
    ins_number: "211",
    category: "preservative",
    risk_level: "high",
    risk_summary: "Forms benzene (a class-1 carcinogen) when mixed with Vitamin C (Ascorbic Acid).",
    cancer_risk: true,
    hyperactivity_risk: true,
    status_india: "permitted",
    banned_countries: ["Restricted in EU for children's beverages"],
    plain_english_explainer: "A common preservative in soft drinks. If consumed alongside Vitamin C, they react to create Benzene, which damages DNA and can cause leukemia.",
    safer_alternative: "Citric acid or pasteurization"
  },
  {
    name: "Potassium Bromate",
    e_number: "E924",
    ins_number: "924",
    category: "bleaching_agent",
    risk_level: "very_high",
    risk_summary: "Carcinogenic, damages kidneys, disrupts thyroid, and causes genetic mutations.",
    cancer_risk: true,
    cancer_evidence_level: "IARC Group 2B",
    kidney_risk: true,
    thyroid_risk: true,
    status_india: "banned (partially, but still found in bakery products)",
    banned_countries: ["EU", "UK", "Canada", "Brazil", "China"],
    plain_english_explainer: "Used to strengthen bread dough. It is a powerful carcinogen banned in almost all major economies. It remains a major concern in some Indian local bakery products.",
    safer_alternative: "Ascorbic Acid (Vitamin C) or Enzyme treatment"
  },
  // Sweeteners
  {
    name: "Aspartame",
    e_number: "E951",
    ins_number: "951",
    category: "sweetener",
    risk_level: "high",
    risk_summary: "Classified as possibly carcinogenic (Group 2B) by IARC in 2023. Triggers headaches and mood issues in some.",
    cancer_risk: true,
    cancer_evidence_level: "IARC Group 2B",
    status_india: "permitted",
    banned_countries: [],
    plain_english_explainer: "A highly popular artificial sugar substitute. It was declared a possible carcinogen in 2023. Highly dangerous for people with phenylketonuria (PKU).",
    safer_alternative: "Stevia or Monk fruit extract"
  },
  {
    name: "Acesulfame-K",
    e_number: "E950",
    ins_number: "950",
    category: "sweetener",
    risk_level: "medium",
    risk_summary: "Thyroid disruption in animal studies; contains methylene chloride (a known solvent).",
    cancer_risk: false,
    thyroid_risk: true,
    status_india: "permitted",
    banned_countries: [],
    plain_english_explainer: "An artificial sweetener often blended with Aspartame. Some studies suggest it can harm gut health and alter thyroid function.",
    safer_alternative: "Erythritol or Stevia"
  },
  {
    name: "Cyclamate",
    e_number: "E952",
    ins_number: "952",
    category: "sweetener",
    risk_level: "high",
    risk_summary: "Linked to bladder cancer and testicular atrophy in animal tests.",
    cancer_risk: true,
    status_india: "banned",
    banned_countries: ["USA", "UK"],
    plain_english_explainer: "An early artificial sweetener. Banned in the United States and UK since 1969 due to high bladder tumor risk in lab mice.",
    safer_alternative: "Stevia"
  }
];

// 2. ENCYCLOPEDIA INGREDIENTS
const encyclopediaIngredients = [
  {
    name: "Maida",
    aliases: ["Refined Wheat Flour", "All Purpose Flour", "Wheat Flour (Refined)"],
    category: "grain",
    what_is_it: "Wheat flour that has been stripped of its fiber, bran, and key nutrients, then bleached.",
    what_it_does_to_body: "Causes rapid spikes in blood glucose due to high glycemic index, leading to insulin resistance, fat storage, and increased diabetes risk.",
    found_in_products: ["Biscuits", "Noodles", "Bread", "Cakes", "Samosas"],
    is_harmful: true
  },
  {
    name: "Palm Oil",
    aliases: ["Refined Palm Oil", "Palmolein Oil", "Fractionated Palm Oil"],
    category: "fat",
    what_is_it: "An edible vegetable oil derived from the fruit of oil palms.",
    what_it_does_to_body: "Highly saturated fat content increases LDL (bad) cholesterol, raising the risk of cardiovascular disease. High in inflammatory omega-6 fatty acids.",
    found_in_products: ["Chips", "Namkeen", "Chocolate spreads", "Instant noodles"],
    is_harmful: true
  },
  {
    name: "Monosodium Glutamate",
    aliases: ["MSG", "Ajinomoto", "E621", "Yeast Extract"],
    e_number: "E621",
    category: "flavor_enhancer",
    what_is_it: "The sodium salt of glutamic acid, used to add 'umami' savory flavor.",
    what_it_does_to_body: "Can cause flushing, headaches, sweating, and rapid heartbeat in sensitive individuals (MSG symptom complex). Highly addictive, encouraging overeating.",
    found_in_products: ["Soups", "Chinese food", "Noodles", "Potato chips"],
    is_harmful: true
  },
  {
    name: "High Fructose Corn Syrup",
    aliases: ["HFCS", "Fructose syrup", "Corn syrup"],
    category: "sweetener",
    what_is_it: "A liquid sweetener made from corn starch, high in free fructose.",
    what_it_does_to_body: "Processed directly by the liver, converting into fat and causing fatty liver disease (NAFLD), obesity, and type-2 diabetes.",
    found_in_products: ["Soft drinks", "Ketchups", "Sweetened yogurts"],
    is_harmful: true
  },
  {
    name: "Carrageenan",
    aliases: ["E407", "Irish moss extract"],
    e_number: "E407",
    category: "emulsifier",
    what_is_it: "A gum extracted from red seaweed, used to thicken foods.",
    what_it_does_to_body: "Can cause gastrointestinal inflammation, bloating, and IBS flare-ups. Animal studies link degraded carrageenan to colon ulcers.",
    found_in_products: ["Soy milk", "Almond milk", "Ice creams", "Cottage cheese"],
    is_harmful: true
  }
];

// 3. SEED PRODUCTS
const seedProducts = [
  {
    barcode: "8901058002316",
    name: "Maggi 2-Minute Masala Noodles",
    brand: "Nestle",
    category: "Packaged Foods",
    subcategory: "Instant Noodles",
    serving_size_g: 70,
    actual_serving_size_g: 140, // 2 cakes is real serving
    pack_size_g: 280,
    is_vegetarian: true,
    health_score: 2.5,
    fssai_license: "10012011000168",
    manufacturer: "Nestle India Limited, New Delhi",
    country_of_origin: "India",
    verified: true,
    data_source: "manual",
    nutrition: {
      energy_kcal: 427,
      protein_g: 8.0,
      carbohydrates_g: 63.5,
      sugars_g: 2.2,
      added_sugars_g: 1.5,
      fat_g: 15.7,
      saturated_fat_g: 7.2,
      trans_fat_g: 0.1,
      fiber_g: 2.0,
      sodium_mg: 1250, // Massive sodium
      maida_percentage: 82, // Mostly refined flour
      palm_oil_present: true,
      glycemic_index_estimate: 70
    },
    ingredients: [
      { name: "Refined Wheat Flour (Maida)", position: 1, is_allergen: true, allergen_type: "gluten" },
      { name: "Palm Oil", position: 2, is_allergen: false },
      { name: "Salt", position: 3, is_allergen: false },
      { name: "Wheat Gluten", position: 4, is_allergen: true, allergen_type: "gluten" },
      { name: "Mineral (Calcium Carbonate)", position: 5, is_allergen: false },
      { name: "Thickeners (Guar Gum)", position: 6, is_allergen: false },
      { name: "Acidity Regulators (Potassium Carbonate)", position: 7, is_allergen: false },
      { name: "Monosodium Glutamate", position: 8, e_number: "E621", is_allergen: false },
      { name: "Preservative (TBHQ)", position: 9, e_number: "E319", is_allergen: false }
    ],
    alternatives: [
      { alternative_barcode: "8906082525413", reason: "Slurrp Farm Millet Noodles contain 100% whole grain Ragi and Foxtail Millet, air-dried (not fried in palm oil), and have 60% less sodium." },
      { alternative_barcode: "8901058862569", reason: "Nestle Oats Noodles are a fiber-rich alternative with whole grain oats flour and reduced maida." }
    ]
  },
  {
    barcode: "8901725181223",
    name: "Kurkure Masala Munch",
    brand: "PepsiCo India",
    category: "Snacks",
    subcategory: "Namkeen / Chips",
    serving_size_g: 30,
    actual_serving_size_g: 90, // Full pack is regular consumption
    pack_size_g: 90,
    is_vegetarian: true,
    health_score: 3.0,
    fssai_license: "10012022000282",
    manufacturer: "PepsiCo India Holdings Pvt. Ltd., Gurgaon",
    country_of_origin: "India",
    verified: true,
    data_source: "manual",
    nutrition: {
      energy_kcal: 558,
      protein_g: 6.2,
      carbohydrates_g: 55.4,
      sugars_g: 1.5,
      added_sugars_g: 0.8,
      fat_g: 34.3, // Very high fat
      saturated_fat_g: 16.0,
      trans_fat_g: 0.1,
      fiber_g: 1.5,
      sodium_mg: 890,
      maida_percentage: 0, // Corn/rice meal base
      palm_oil_present: true,
      glycemic_index_estimate: 68
    },
    ingredients: [
      { name: "Rice Meal", position: 1, is_allergen: false },
      { name: "Corn Meal", position: 2, is_allergen: false },
      { name: "Gram Meal", position: 3, is_allergen: false },
      { name: "Edible Vegetable Oil (Palm Oil)", position: 4, is_allergen: false },
      { name: "Spices and Condiments (Chili, Onion, Garlic)", position: 5, is_allergen: false },
      { name: "Salt", position: 6, is_allergen: false },
      { name: "Acidity Regulator (Citric Acid)", position: 7, is_allergen: false },
      { name: "Flavor Enhancer (Disodium Guanylate)", position: 8, e_number: "E627", is_allergen: false },
      { name: "Flavor Enhancer (Disodium Inosinate)", position: 9, e_number: "E631", is_allergen: false },
      { name: "Tartrazine", position: 10, e_number: "E102", is_allergen: false }
    ],
    alternatives: [
      { alternative_barcode: "8906109250069", reason: "The Better Munch Baked Ragi Puffs are baked, not fried, contain zero palm oil, and have a 100% clean whole grain ragi base." }
    ]
  },
  {
    barcode: "8906082525413",
    name: "Slurrp Farm Millet Noodles (Ragi & Foxtail)",
    brand: "Slurrp Farm",
    category: "Packaged Foods",
    subcategory: "Instant Noodles",
    serving_size_g: 70,
    actual_serving_size_g: 70,
    pack_size_g: 70,
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: false,
    health_score: 8.5,
    fssai_license: "10822005000108",
    manufacturer: "Wholsum Foods Pvt Ltd, New Delhi",
    country_of_origin: "India",
    verified: true,
    data_source: "manual",
    nutrition: {
      energy_kcal: 350,
      protein_g: 11.2,
      carbohydrates_g: 71.0,
      sugars_g: 0.5,
      added_sugars_g: 0,
      fat_g: 1.8, // Low fat (not fried)
      saturated_fat_g: 0.3,
      trans_fat_g: 0,
      fiber_g: 8.5, // High fiber
      sodium_mg: 210, // Very low sodium
      maida_percentage: 0,
      palm_oil_present: false,
      glycemic_index_estimate: 55
    },
    ingredients: [
      { name: "Ragi Flour (Finger Millet)", position: 1, is_allergen: false },
      { name: "Foxtail Millet Flour", position: 2, is_allergen: false },
      { name: "Whole Wheat Flour", position: 3, is_allergen: true, allergen_type: "gluten" },
      { name: "Guar Gum (Natural binder)", position: 4, is_allergen: false },
      { name: "Dehydrated Vegetables", position: 5, is_allergen: false },
      { name: "Natural Spices (Turmeric, Coriander, Pepper)", position: 6, is_allergen: false }
    ],
    alternatives: []
  },
  {
    barcode: "8906109250069",
    name: "Baked Ragi Puffs - Pudina Herb",
    brand: "The Better Munch",
    category: "Snacks",
    subcategory: "Namkeen / Chips",
    serving_size_g: 30,
    actual_serving_size_g: 30,
    pack_size_g: 60,
    is_vegetarian: true,
    is_vegan: true,
    health_score: 9.0,
    fssai_license: "11520034000450",
    manufacturer: "Better Foods India, Mumbai",
    country_of_origin: "India",
    verified: true,
    data_source: "manual",
    nutrition: {
      energy_kcal: 380,
      protein_g: 9.5,
      carbohydrates_g: 68.0,
      sugars_g: 1.0,
      added_sugars_g: 0,
      fat_g: 6.2, // Air puffed, low oil
      saturated_fat_g: 1.1,
      trans_fat_g: 0,
      fiber_g: 10.2, // Great fiber
      sodium_mg: 340,
      maida_percentage: 0,
      palm_oil_present: false,
      glycemic_index_estimate: 52
    },
    ingredients: [
      { name: "Ragi (Finger Millet) Flour", position: 1, is_allergen: false },
      { name: "Jowar (Sorghum) Flour", position: 2, is_allergen: false },
      { name: "Cold Pressed Rice Bran Oil (Spray)", position: 3, is_allergen: false },
      { name: "Dry Mint Powder", position: 4, is_allergen: false },
      { name: "Rock Salt", position: 5, is_allergen: false },
      { name: "Spices (Pepper, Dry Mango Powder)", position: 6, is_allergen: false }
    ],
    alternatives: []
  }
];

// Seed main function
async function seed() {
  console.log("=== ARHA-FoodLens Database Seeder ===");

  // A. Save data locally as seed_data.json fallback first (ensuring zero-config run)
  const localDataPath = path.resolve(__dirname, '../data');
  const localDataFile = path.resolve(localDataPath, 'seed_data.json');
  
  if (!fs.existsSync(localDataPath)) {
    fs.mkdirSync(localDataPath, { recursive: true });
  }

  const completeData = {
    harmfulSubstances,
    encyclopediaIngredients,
    seedProducts
  };

  fs.writeFileSync(localDataFile, JSON.stringify(completeData, null, 2), 'utf-8');
  console.log(`[Local Fallback] Seed data written successfully to ${localDataFile}`);

  // B. Attempt to seed Supabase if credentials are setup and are not placeholder
  const isSupabaseConfigured = 
    supabaseUrl && 
    supabaseUrl !== 'https://your-project-id.supabase.co' && 
    supabaseServiceKey && 
    supabaseServiceKey !== 'your-service-role-key-here';

  if (!isSupabaseConfigured) {
    console.log("[Supabase Warning] Supabase credentials in .env.local are placeholders. Skipping remote database seeding.");
    console.log("[Supabase Warning] The app will successfully fallback to the generated local JSON seed file.");
    return;
  }

  console.log("[Supabase Seeding] Connecting to Supabase at", supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Seed Harmful Substances
    console.log("Seeding harmful substances...");
    for (const sub of harmfulSubstances) {
      const { data, error } = await supabase
        .from('harmful_substances')
        .upsert(sub, { onConflict: 'name' })
        .select();
      if (error) throw error;
    }
    console.log(`Seeded ${harmfulSubstances.length} harmful substances.`);

    // 2. Seed Encyclopedia Ingredients
    console.log("Seeding encyclopedia ingredients...");
    for (const ing of encyclopediaIngredients) {
      // Find linked harmful substance if any
      let linkedSub = null;
      if (ing.e_number) {
        const { data: subData } = await supabase
          .from('harmful_substances')
          .select('id')
          .eq('e_number', ing.e_number)
          .single();
        if (subData) linkedSub = subData.id;
      }
      
      const payload = {
        name: ing.name,
        aliases: ing.aliases,
        e_number: ing.e_number,
        category: ing.category,
        what_is_it: ing.what_is_it,
        what_it_does_to_body: ing.what_it_does_to_body,
        found_in_products: ing.found_in_products,
        is_harmful: ing.is_harmful,
        harmful_substance_id: linkedSub
      };

      const { error } = await supabase
        .from('ingredient_encyclopedia')
        .upsert(payload, { onConflict: 'name' });
      if (error) throw error;
    }
    console.log(`Seeded ${encyclopediaIngredients.length} encyclopedia ingredients.`);

    // 3. Seed Products, Nutrition, and Ingredients
    console.log("Seeding products, nutrition, and ingredients...");
    for (const prod of seedProducts) {
      // A. Insert Product
      const productPayload = {
        barcode: prod.barcode,
        name: prod.name,
        brand: prod.brand,
        category: prod.category,
        subcategory: prod.subcategory,
        serving_size_g: prod.serving_size_g,
        actual_serving_size_g: prod.actual_serving_size_g,
        pack_size_g: prod.pack_size_g,
        is_vegetarian: prod.is_vegetarian,
        is_vegan: prod.is_vegan || false,
        is_jain: prod.is_jain || false,
        is_halal: prod.is_halal || false,
        is_gluten_free: prod.is_gluten_free || false,
        health_score: prod.health_score,
        fssai_license: prod.fssai_license,
        manufacturer: prod.manufacturer,
        country_of_origin: prod.country_of_origin,
        verified: prod.verified,
        data_source: prod.data_source
      };

      const { data: pData, error: pError } = await supabase
        .from('products')
        .upsert(productPayload, { onConflict: 'barcode' })
        .select()
        .single();
      
      if (pError) throw pError;
      const productId = pData.id;

      // B. Insert Nutrition
      const nutritionPayload = {
        product_id: productId,
        ...prod.nutrition
      };
      const { error: nError } = await supabase
        .from('nutrition')
        .upsert(nutritionPayload, { onConflict: 'product_id' });
      if (nError) throw nError;

      // C. Insert Ingredients
      // Clean existing ingredients for this product first
      await supabase.from('ingredients').delete().eq('product_id', productId);
      
      for (const ing of prod.ingredients) {
        // Link harmful substance if matches e_number or name
        let linkedSub = null;
        if (ing.e_number) {
          const { data: subData } = await supabase
            .from('harmful_substances')
            .select('id')
            .eq('e_number', ing.e_number)
            .single();
          if (subData) linkedSub = subData.id;
        } else {
          const { data: subData } = await supabase
            .from('harmful_substances')
            .select('id')
            .eq('name', ing.name)
            .single();
          if (subData) linkedSub = subData.id;
        }

        const ingredientPayload = {
          product_id: productId,
          ingredient_name: ing.name,
          e_number: ing.e_number || null,
          position: ing.position,
          is_allergen: ing.is_allergen || false,
          allergen_type: ing.allergen_type || null,
          substance_id: linkedSub
        };
        
        const { error: ingError } = await supabase
          .from('ingredients')
          .insert(ingredientPayload);
        if (ingError) throw ingError;
      }
    }
    console.log(`Seeded ${seedProducts.length} full products with nutrition and ingredients.`);

    // 4. Seed Product Alternatives
    console.log("Seeding product alternatives mapping...");
    for (const prod of seedProducts) {
      if (!prod.alternatives || prod.alternatives.length === 0) continue;
      
      const { data: originalProduct } = await supabase
        .from('products')
        .select('id')
        .eq('barcode', prod.barcode)
        .single();
        
      if (!originalProduct) continue;

      for (const alt of prod.alternatives) {
        const { data: altProduct } = await supabase
          .from('products')
          .select('id')
          .eq('barcode', alt.alternative_barcode)
          .single();
          
        if (!altProduct) continue;

        const altPayload = {
          product_id: originalProduct.id,
          alternative_product_id: altProduct.id,
          reason: alt.reason,
          category_match: true,
          price_range: 'similar'
        };

        await supabase
          .from('product_alternatives')
          .upsert(altPayload, { onConflict: 'product_id,alternative_product_id' });
      }
    }
    console.log("Seeded product alternatives successfully.");
    console.log("[Supabase Seeding] Seeding completed successfully!");

  } catch (err) {
    console.error("[Supabase Seeding Error] Fail to seed database:", err.message);
  }
}

seed();
