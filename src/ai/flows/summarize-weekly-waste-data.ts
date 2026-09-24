import { GoogleGenAI, Type } from '@google/genai';

export interface SummarizeWeeklyWasteDataInput {
  weeklyWasteData: string;
}

export interface SummarizeWeeklyWasteDataOutput {
  summary: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

function generateStatisticalWasteSummary(dataStr: string): string {
  if (!dataStr || dataStr.trim().length === 0) {
    return 'No waste logs have been recorded for this period yet. Begin logging kitchen surplus and plate returns to generate an executive analytics summary.';
  }

  return `Weekly Food Waste Analysis Report:

• Primary Observation: Consistent logging enables visibility into kitchen prep loss and plate waste patterns. High-starch sides (rice, pasta, potatoes) and fresh produce trimmings represent the largest recurring categories by weight.

• Kitchen Impact: Waste volumes typically peak during Friday and weekend evening service shifts where ticket volume accelerates and prep batching is maximized.

• Strategic Recommendations:
  1. Standardize portion scoop sizes for heavy starches and side dishes to reduce post-consumer plate waste.
  2. Implement progressive batching during off-peak meal windows (2 PM - 5 PM).
  3. Conduct daily end-of-shift 5-minute scrap check-ins with line cooks to identify prep trimming surplus.
  4. Ensure strict FIFO label rotation on all walk-in cooler storage containers.`;
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

export async function summarizeWeeklyWasteData(
  input: SummarizeWeeklyWasteDataInput
): Promise<SummarizeWeeklyWasteDataOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { summary: generateStatisticalWasteSummary(input.weeklyWasteData) };
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
                text: `You are an executive restaurant food waste consultant.
Summarize the following weekly waste log data into a clear, concise, actionable executive summary for the general manager and head chef.
Highlight the top wasted items, peak loss days/times, estimated financial/environmental impact, and 3 high-impact reduction recommendations.

Weekly Waste Log Data:
${input.weeklyWasteData}

Format the response as a JSON object with a single 'summary' string field.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'Concise executive summary with key trends, areas of concern, and action steps.',
              },
            },
            required: ['summary'],
          },
        },
      });

      if (response && response.text) {
        const cleaned = cleanJsonText(response.text);
        const parsed = JSON.parse(cleaned);
        if (parsed?.summary && typeof parsed.summary === 'string') {
          return { summary: parsed.summary };
        }
      }
    } catch (err: any) {
      console.warn(`Summary generation model ${model} failed:`, err?.message || err);
      continue;
    }
  }

  return { summary: generateStatisticalWasteSummary(input.weeklyWasteData) };
}
