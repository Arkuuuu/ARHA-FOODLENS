import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const isMockGemini = !apiKey || apiKey.includes('your-gemini-api-key');

// Initialize GoogleGenAI client if api key is available
const ai = !isMockGemini ? new GoogleGenAI({ apiKey }) : null;

export interface UserProfile {
  name: string;
  age?: number;
  gender?: string;
  conditions?: string[]; // diabetes, hypertension, pcod, thyroid, cholesterol, kidney, liver, heart
  allergies?: string[]; // gluten, lactose, nuts, soy, eggs
  dietary_type?: string; // vegetarian, vegan, jain, halal, non_veg
  goal?: string;
  medications?: string[];
  is_pregnant?: boolean;
  profile_mode?: 'adult' | 'child' | 'senior';
}

export interface VerdictResult {
  verdict: 'SAFE' | 'CAUTION' | 'AVOID';
  score: number;
  reasons: string[];
  realServingDisclaimer: string;
  claimChecker: Array<{ claim: string; reality: string; honest: boolean }>;
  consequence: string;
}

// Gemini Service Wrapper
export const gemini = {
  isMock: isMockGemini,

  async extractLabelNutrition(imageBase64: string): Promise<any> {
    if (isMockGemini || !ai) {
      console.log("[Gemini Mock Mode] Extracting nutrition from mock label photo");
      // Simulate slow API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a simulated parsed response for a snack product
      return {
        name: "Scanned Chips",
        brand: "Unknown Brand",
        serving_size_g: 30,
        pack_size_g: 90,
        nutrition: {
          energy_kcal: 540,
          protein_g: 5.5,
          carbohydrates_g: 58.0,
          sugars_g: 3.5,
          added_sugars_g: 1.2,
          fat_g: 32.0,
          saturated_fat_g: 14.5,
          trans_fat_g: 0.1,
          sodium_mg: 950,
          maida_percentage: 0,
          palm_oil_present: true
        },
        ingredients: [
          { name: "Potato", position: 1 },
          { name: "Refined Palm Oil", position: 2 },
          { name: "Salt", position: 3 },
          { name: "Spices", position: 4 },
          { name: "Monosodium Glutamate", e_number: "E621", position: 5 },
          { name: "Sunset Yellow", e_number: "E110", position: 6 }
        ]
      };
    }

    try {
      // Prompt for structured extraction
      const prompt = `
        Analyze this food nutrition label and ingredients photo.
        Extract the following data as a strict JSON structure.
        Do not output markdown block wrappers (like \`\`\`json). Output raw JSON string only.
        
        Fields required in JSON:
        {
          "name": "Product Name (estimate if not visible)",
          "brand": "Brand Name (estimate if not visible)",
          "serving_size_g": 0, (serving size in grams)
          "pack_size_g": 0, (total package weight in grams)
          "nutrition": {
            "energy_kcal": 0, (per 100g)
            "protein_g": 0, (per 100g)
            "carbohydrates_g": 0, (per 100g)
            "sugars_g": 0, (per 100g)
            "added_sugars_g": 0, (per 100g)
            "fat_g": 0, (per 100g)
            "saturated_fat_g": 0, (per 100g)
            "trans_fat_g": 0, (per 100g)
            "sodium_mg": 0, (per 100g)
            "maida_percentage": 0, (estimate % of refined wheat flour / maida if mentioned in ingredients)
            "palm_oil_present": false (true if palm oil or palmolein is in ingredients)
          },
          "ingredients": [
            { "name": "Ingredient Name", "e_number": "E-Number if found (e.g. E102)", "position": 1 }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: imageBase64.split(',')[1] || imageBase64,
              mimeType: 'image/jpeg'
            }
          }
        ]
      });

      const text = response.text || '';
      // Sanitize output for potential markdown blocks
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error("Gemini Vision API error:", err);
      throw new Error("Failed to parse label image using Gemini.");
    }
  },

  async generateVerdict(product: any, profile: UserProfile): Promise<VerdictResult> {
    // Check if we are running in mock mode
    if (isMockGemini || !ai) {
      console.log("[Gemini Mock Mode] Generating mock personalized verdict");
      
      const isDiabetic = profile.conditions?.includes('diabetes') || profile.conditions?.includes('prediabetes');
      const isHypertensive = profile.conditions?.includes('hypertension');
      const isPregnant = profile.is_pregnant;
      const isChild = profile.profile_mode === 'child';
      
      const name = product.name || 'Product';
      const brand = product.brand || 'Brand';

      // Standard calculations
      let score = product.health_score || 5.0;
      let reasons: string[] = [];
      let claimChecker = [
        { claim: "Baked not Fried", reality: "Contains significant amounts of spray oil and carbs.", honest: false }
      ];
      let realServingDisclaimer = `This pack says 1 serving is ${product.serving_size_g || 30}g, but you will likely consume the full ${product.pack_size_g || 90}g pack, which contains ${Math.round((product.nutrition?.sodium_mg || 0) * ((product.pack_size_g || 90) / 100))}mg of Sodium.`;

      // Custom mock rule-based engine to simulate personalized verdicts
      if (isDiabetic) {
        const sugar = product.nutrition?.sugars_g || 0;
        const carbs = product.nutrition?.carbohydrates_g || 0;
        const hasMaida = product.nutrition?.maida_percentage > 0;
        
        if (sugar > 10 || carbs > 50 || hasMaida) {
          score = Math.max(1.5, score - 3.5);
          reasons.push("High Refined Carbs / Sugar: Spikes blood glucose rapidly, forcing insulin release.");
          if (hasMaida) reasons.push(`Contains ${product.nutrition.maida_percentage}% Maida, which has a very high Glycemic Index.`);
        }
      }

      if (isHypertensive) {
        const sodium = product.nutrition?.sodium_mg || 0;
        if (sodium > 400) {
          score = Math.max(1.0, score - 3.0);
          reasons.push(`Extreme Sodium content (${sodium}mg/100g): Leads to fluid retention and elevates blood pressure.`);
        }
      }

      if (isPregnant) {
        const hasColors = product.ingredients?.some((i: any) => i.e_number && ["E102", "E110", "E122", "E124"].includes(i.e_number));
        const hasTBHQ = product.ingredients?.some((i: any) => i.e_number === "E319");
        
        if (hasColors || hasTBHQ) {
          score = Math.max(1.0, score - 4.0);
          reasons.push("Contains synthetic food additives (colors/preservatives) that cross the placental barrier and are contested globally.");
        }
      }

      if (isChild) {
        const hasColors = product.ingredients?.some((i: any) => i.e_number && ["E102", "E110", "E122", "E124"].includes(i.e_number));
        if (hasColors) {
          score = Math.max(1.5, score - 4.5);
          reasons.push("Contains artificial food colors linked to hyperactivity and ADHD in children (EU warning required).");
        }
      }

      // Add default reasons if list is empty
      if (reasons.length === 0) {
        if (product.nutrition?.palm_oil_present) {
          reasons.push("Contains Refined Palm Oil: Saturated fat density increases arterial clogging risk.");
        }
        if (score < 4) {
          reasons.push("Ultra-processed food index: Low fiber and minimal protein content.");
        } else {
          reasons.push("Healthy profile match: Low added sugars and moderate sodium content.");
        }
      }

      // Claim checks
      if (product.name.toLowerCase().includes('maggi')) {
        claimChecker = [
          { claim: "2-Minute Instant", reality: "Takes 2 minutes but leaves persistent digestive sluggishness due to Maida.", honest: false },
          { claim: "Goodness of Iron", reality: "Fortified with minor synthetic iron, but high sodium offsets health benefits.", honest: false }
        ];
      } else if (product.name.toLowerCase().includes('kurkure') || product.name.toLowerCase().includes('lays')) {
        claimChecker = [
          { claim: "No Added MSG", reality: "Contains Yeast Extract and hydrolysed proteins which naturally yield glutamates.", honest: false }
        ];
      } else {
        claimChecker = [
          { claim: "Natural Ingredients", reality: "Contains natural identical flavorings and emulsifiers.", honest: true }
        ];
      }

      const verdict = score >= 7.0 ? 'SAFE' : score >= 4.0 ? 'CAUTION' : 'AVOID';
      const consequence = verdict === 'AVOID' 
        ? `Consuming this product 3x or more per week increases metabolic syndrome markers, exacerbating risk for chronic ${profile.conditions?.join('/') || 'obesity'} conditions.`
        : `Generally safe for occasional consumption, but maintain tracking of daily carbohydrate limits.`;

      return {
        verdict,
        score: parseFloat(score.toFixed(1)),
        reasons: reasons.slice(0, 3),
        realServingDisclaimer,
        claimChecker,
        consequence
      };
    }

    try {
      const prompt = `
        You are a highly precise Indian clinical nutritionist and food toxicologist.
        Analyze this food product and user profile, and return a personalized food health verdict as a strict JSON structure.
        Do not output markdown block wrappers (like \`\`\`json). Output raw JSON string only.

        USER PROFILE:
        - Age: ${profile.age || 'Unknown'}
        - Gender: ${profile.gender || 'Unknown'}
        - Health Conditions: ${profile.conditions?.join(', ') || 'None'}
        - Allergies: ${profile.allergies?.join(', ') || 'None'}
        - Dietary Preference: ${profile.dietary_type || 'None'}
        - Active Medications: ${profile.medications?.join(', ') || 'None'}
        - Pregnant: ${profile.is_pregnant ? 'Yes' : 'No'}
        - Profile Mode: ${profile.profile_mode || 'adult'}

        PRODUCT DETAILS:
        - Name: ${product.name}
        - Brand: ${product.brand}
        - Base Health Score: ${product.health_score}/10
        - Nutritional Values: ${JSON.stringify(product.nutrition)}
        - Ingredients List: ${JSON.stringify(product.ingredients)}

        Task:
        1. Calculate a personalized score out of 10. Penalize ingredients heavily if they conflict with the user's specific health conditions (e.g. sugar for diabetes, sodium for hypertension, chemicals/preservatives for children/pregnant).
        2. Set verdict: "SAFE" (score >= 7), "CAUTION" (score 4-6.9), or "AVOID" (score < 4).
        3. Identify the top 3 specific reasons for this user.
        4. Detail serving size manipulation: compare label serving size to actual standard consumption patterns.
        5. Verify marketing claims printed on the packet (e.g. check if claims like 'baked', 'multigrain', 'high protein' are misleading based on nutrition/ingredients).
        6. Explain the long term health consequence of eating this product regularly (3x/week).

        Fields required in JSON:
        {
          "verdict": "SAFE" | "CAUTION" | "AVOID",
          "score": 0.0,
          "reasons": [
            "Reason 1 with explanation...",
            "Reason 2...",
            "Reason 3..."
          ],
          "realServingDisclaimer": "Text explaining serving size vs real consumption...",
          "claimChecker": [
            { "claim": "Claim name", "reality": "Actual explanation...", "honest": false }
          ],
          "consequence": "Text describing long-term clinical risks of regular consumption..."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error("Gemini generateVerdict API error:", err);
      // Fallback to mock logic if network fails
      return this.generateVerdict(product, { ...profile, name: 'Fallback' });
    }
  }
};
