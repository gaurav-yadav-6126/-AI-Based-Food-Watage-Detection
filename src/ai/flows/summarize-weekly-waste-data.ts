import { GoogleGenAI, Type } from '@google/genai';

export interface SummarizeWeeklyWasteDataInput {
  weeklyWasteData: string;
}

export interface SummarizeWeeklyWasteDataOutput {
  summary: string;
}

export async function summarizeWeeklyWasteData(
  input: SummarizeWeeklyWasteDataInput
): Promise<SummarizeWeeklyWasteDataOutput> {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: `You are an AI assistant for restaurant managers. Your task is to summarize the weekly waste data provided to you in a concise and understandable format. Highlight key trends and areas of concern so the manager can quickly grasp the overall waste situation and make informed decisions. Make sure to focus on the most important points, and keep it brief.

Weekly Waste Data: ${input.weeklyWasteData}` }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: 'A concise summary of the weekly waste data, highlighting key trends and areas of concern.'
          }
        },
        required: ['summary']
      }
    }
  });

  if (!response.text) {
    throw new Error('No response from Gemini');
  }

  return JSON.parse(response.text) as SummarizeWeeklyWasteDataOutput;
}
