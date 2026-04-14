import { GoogleGenAI, Type } from '@google/genai';

export interface WasteReductionTipsInput {
  wasteAnalytics: string;
  restaurantType: string;
  menuItems: string;
}

export interface WasteReductionTipsOutput {
  tips: string[];
}

export async function generateWasteReductionTips(
  input: WasteReductionTipsInput
): Promise<WasteReductionTipsOutput> {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: `You are an expert in food waste reduction for restaurants. Based on the provided waste analytics, restaurant type and menu items, generate personalized tips for the restaurant to reduce food waste.

Waste Analytics: ${input.wasteAnalytics}
Restaurant Type: ${input.restaurantType}
Menu Items: ${input.menuItems}

Provide specific and actionable tips that the restaurant can implement immediately. Focus on solutions tailored to their specific situation.

Tips should be clear, concise, and easy to understand. The tips should be returned as an array of strings.

Example:
[
  "Reduce portion sizes for dishes with high wastage.",
  "Implement a FIFO (First In, First Out) system for food storage.",
  "Offer discounts on nearing expiry date items.",
  "Compost food waste."
]` }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tips: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: 'Personalized tips for reducing food waste in the restaurant.'
          }
        },
        required: ['tips']
      }
    }
  });

  if (!response.text) {
    throw new Error('No response from Gemini');
  }

  return JSON.parse(response.text) as WasteReductionTipsOutput;
}
