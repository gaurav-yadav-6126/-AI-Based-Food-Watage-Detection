'use server';

import { analyzeUploadedFoodImage as analyzeUploadedFoodImageFlow } from '@/ai/flows/analyze-uploaded-food-image';
import type { AnalyzeUploadedFoodImageInput } from '@/ai/flows/analyze-uploaded-food-image';
import { generateWasteReductionTips as generateWasteReductionTipsFlow } from '@/ai/flows/generate-waste-reduction-tips';
import type { WasteReductionTipsInput } from '@/ai/flows/generate-waste-reduction-tips';
import { summarizeWeeklyWasteData as summarizeWeeklyWasteDataFlow } from '@/ai/flows/summarize-weekly-waste-data';
import type { SummarizeWeeklyWasteDataInput } from '@/ai/flows/summarize-weekly-waste-data';

export async function analyzeUploadedFoodImage(input: AnalyzeUploadedFoodImageInput) {
    return await analyzeUploadedFoodImageFlow(input);
}

export async function generateWasteReductionTips(input: WasteReductionTipsInput) {
    return await generateWasteReductionTipsFlow(input);
}

export async function summarizeWeeklyWasteData(input: SummarizeWeeklyWasteDataInput) {
    return await summarizeWeeklyWasteDataFlow(input);
}
