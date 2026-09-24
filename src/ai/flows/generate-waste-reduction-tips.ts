import { GoogleGenAI, Type } from '@google/genai';

export interface WasteReductionTipsInput {
  wasteAnalytics: string;
  restaurantType: string;
  menuItems: string;
}

export interface WasteReductionTipsOutput {
  tips: string[];
}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

function getHeuristicTips(input: WasteReductionTipsInput): string[] {
  const restaurant = (input.restaurantType || 'restaurant').toLowerCase();
  const tips: string[] = [];

  if (restaurant.includes('buffet') || restaurant.includes('catering')) {
    tips.push('Shift to small-batch replenishment during the last 90 minutes of service to prevent surplus trays.');
    tips.push('Implement progressive pan downsizing on display lines to keep presentations full while reducing volume.');
    tips.push('Monitor end-of-service tray logs daily to calibrate prep quantities against actual customer footfall.');
    tips.push('Repurpose unserved heated ingredients into daily specials, stews, or stocks under safe food handling protocols.');
  } else if (restaurant.includes('fast') || restaurant.includes('cafe')) {
    tips.push('Audit batch brewing and display bakery rotation every 2 hours to prevent stale item shrinkage.');
    tips.push('Implement standardized portion scoops and dispensers for sandwich proteins, sauces, and fries.');
    tips.push('Partner with local surplus food rescue platforms or offer discounted end-of-day grab-and-go boxes.');
    tips.push('Enforce strict First-In, First-Out (FIFO) labeling with high-visibility color-coded day dots in prep coolers.');
  } else if (restaurant.includes('fine') || restaurant.includes('bistro')) {
    tips.push('Utilize root-to-stem vegetable prep: dehydrate herb stems for seasoning oils and roast peels for stocks.');
    tips.push('Pre-portion delicate seafood and premium proteins in vacuum-sealed bags to extend freshness and prevent oxidation.');
    tips.push('Train front-of-house staff to highlight daily chef features incorporating high-inventory perishable items.');
    tips.push('Analyze plate return patterns to identify side dishes frequently left uneaten by guests.');
  } else {
    tips.push('Implement strict FIFO (First In, First Out) inventory rotation with clear date labeling in all refrigeration units.');
    tips.push('Conduct plate waste audits to identify which sides and starches are most frequently left unfinished by diners.');
    tips.push('Calibrate prep par levels based on reservation trends, weather forecasts, and historical day-of-week data.');
    tips.push('Cross-utilize high-volume ingredients across multiple menu items to accelerate turnover and prevent spoilage.');
  }

  return tips;
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export async function generateWasteReductionTips(
  input: WasteReductionTipsInput
): Promise<WasteReductionTipsOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { tips: getHeuristicTips(input) };
  }

  const ai = new GoogleGenAI({ apiKey });

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are a culinary efficiency and food waste reduction expert for commercial restaurants.
Based on the following restaurant profile and data, produce 4 to 6 actionable, high-impact waste reduction tips:

Restaurant Type: ${input.restaurantType || 'General Restaurant'}
Menu Items / Focus: ${input.menuItems || 'General Menu'}
Waste Analytics / Context: ${input.wasteAnalytics || 'Standard kitchen waste'}

Return a JSON object with a 'tips' field containing an array of concise, specific, professional recommendations.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Practical tips for minimizing kitchen and plate waste.',
              },
            },
            required: ['tips'],
          },
        },
      });

      if (response && response.text) {
        const cleaned = cleanJsonText(response.text);
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed?.tips) && parsed.tips.length > 0) {
          return { tips: parsed.tips };
        }
      }
    } catch (err: any) {
      console.warn(`Tips generation model ${model} failed:`, err?.message || err);
      continue;
    }
  }

  return { tips: getHeuristicTips(input) };
}
