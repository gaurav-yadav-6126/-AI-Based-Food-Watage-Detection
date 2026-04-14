import { GoogleGenAI, Type } from '@google/genai';

export interface AnalyzeUploadedFoodImageInput {
  foodImageDataUri: string;
}

export interface AnalyzeUploadedFoodImageOutput {
  foodWasteAnalysis: {
    foodType: string;
    estimatedQuantity: string;
  };
}

export async function analyzeUploadedFoodImage(input: AnalyzeUploadedFoodImageInput): Promise<AnalyzeUploadedFoodImageOutput> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('NEXT_PUBLIC_GEMINI_API_KEY is missing');
    throw new Error('Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Extract base64 and mime type from data URI
  const match = input.foodImageDataUri.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URI format. Please ensure you are uploading a valid image.');
  }
  const mimeType = match[1];
  const base64Data = match[2];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `You are an AI expert in food waste analysis. You will analyze the image of leftover food and identify the type and estimate the quantity of food wasted.
  
  Analyze the following image and provide the type of food wasted and the estimated quantity in grams.
  
  Ensure your response is formatted as a JSON object with fields for foodType and estimatedQuantity. The estimatedQuantity must be a string ending with 'g' (e.g. "150g").` },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodWasteAnalysis: {
              type: Type.OBJECT,
              properties: {
                foodType: { type: Type.STRING, description: 'The type of food wasted (e.g., rice, meat, vegetables).' },
                estimatedQuantity: { type: Type.STRING, description: 'The estimated quantity of food wasted in grams (e.g., "50g", "200g").' }
              },
              required: ['foodType', 'estimatedQuantity']
            }
          },
          required: ['foodWasteAnalysis']
        }
      }
    });

    if (!response.text) {
      throw new Error('Gemini returned an empty response. The image might be unclear or unsupported.');
    }

    return JSON.parse(response.text) as AnalyzeUploadedFoodImageOutput;
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message?.includes('API key not valid')) {
      throw new Error('The provided Gemini API key is invalid. Please check your configuration.');
    }
    if (error.message?.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    }
    throw new Error(`AI Analysis failed: ${error.message || 'Unknown error'}`);
  }
}
