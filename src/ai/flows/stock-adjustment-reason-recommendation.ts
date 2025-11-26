'use server';

/**
 * @fileOverview Recommends stock adjustment reasons based on historical data.
 *
 * - recommendStockAdjustmentReason - A function that recommends stock adjustment reasons.
 * - StockAdjustmentReasonRecommendationInput - The input type for the recommendStockAdjustmentReason function.
 * - StockAdjustmentReasonRecommendationOutput - The return type for the recommendStockAdjustmentReason function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StockAdjustmentReasonRecommendationInputSchema = z.object({
  historicalData: z.string().describe('Historical stock adjustment data as a JSON string.'),
  productName: z.string().describe('The name of the product for which to recommend a reason.'),
});
export type StockAdjustmentReasonRecommendationInput = z.infer<typeof StockAdjustmentReasonRecommendationInputSchema>;

const StockAdjustmentReasonRecommendationOutputSchema = z.object({
  reason: z.string().describe('Recommended reason for the stock adjustment.'),
  confidence: z.number().describe('Confidence level (0-1) for the recommendation.'),
});
export type StockAdjustmentReasonRecommendationOutput = z.infer<typeof StockAdjustmentReasonRecommendationOutputSchema>;

export async function recommendStockAdjustmentReason(input: StockAdjustmentReasonRecommendationInput): Promise<StockAdjustmentReasonRecommendationOutput> {
  return recommendStockAdjustmentReasonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockAdjustmentReasonRecommendationPrompt',
  input: {schema: StockAdjustmentReasonRecommendationInputSchema},
  output: {schema: StockAdjustmentReasonRecommendationOutputSchema},
  prompt: `You are an AI assistant that recommends reasons for stock adjustments based on historical data.

  Given the following historical stock adjustment data:
  {{historicalData}}

  And the product name: {{productName}}

  Recommend a reason for the stock adjustment. Provide a confidence level (0-1) for your recommendation.

  Respond in JSON format.
  `,
});

const recommendStockAdjustmentReasonFlow = ai.defineFlow(
  {
    name: 'recommendStockAdjustmentReasonFlow',
    inputSchema: StockAdjustmentReasonRecommendationInputSchema,
    outputSchema: StockAdjustmentReasonRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
