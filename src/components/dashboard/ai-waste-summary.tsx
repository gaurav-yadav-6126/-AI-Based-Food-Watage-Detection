'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { summarizeWeeklyWasteData } from '@/lib/actions';
import type { WasteData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AiWasteSummaryProps {
  wasteData: WasteData[];
}

export default function AiWasteSummary({ wasteData }: AiWasteSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (wasteData.length === 0) {
      toast({
        title: 'No Waste Logs Found',
        description: 'Log some food waste items or load sample data to generate an AI summary.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Build an informative dataset for Gemini
      const itemsList = wasteData.slice(0, 30).map(item => 
        `- ${item.foodType}: ${item.estimatedQuantity} (Logged: ${new Date(item.timestamp).toLocaleDateString()})`
      ).join('\n');

      const totalQuantity = wasteData.reduce((acc, item) => {
        const match = item.estimatedQuantity.match(/(\d+(\.\d+)?)/);
        return acc + (match ? parseFloat(match[0]) : 0);
      }, 0);

      const promptData = `Total logged entries: ${wasteData.length}\nTotal estimated waste weight: ${totalQuantity.toFixed(0)}g\nIndividual entries breakdown:\n${itemsList}`;

      const result = await summarizeWeeklyWasteData({
        weeklyWasteData: promptData,
      });

      if (result && result.summary) {
        setSummary(result.summary);
        toast({
          title: 'Insights Generated',
          description: 'AI analyzed your waste logs successfully.',
        });
      }
    } catch (error: any) {
      console.error('Failed to generate summary:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Unable to generate AI waste summary.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.03] shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <CardTitle className="text-lg font-headline">AI Waste Intelligence & Weekly Summary</CardTitle>
          </div>
          <CardDescription>
            Gemini analyzes your waste patterns and provides kitchen management recommendations.
          </CardDescription>
        </div>
        <Button
          onClick={handleGenerateSummary}
          disabled={isLoading || wasteData.length === 0}
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Data...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {summary ? 'Refresh Analysis' : 'Generate Summary'}
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="rounded-lg border bg-background/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <TrendingDown className="h-4 w-4" />
              Executive Kitchen Analysis
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {summary}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground bg-muted/20">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/60" />
            <p className="text-sm font-medium">Ready to analyze {wasteData.length} logged waste item{wasteData.length === 1 ? '' : 's'}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Click &quot;Generate Summary&quot; to have Gemini evaluate food categories, quantity trends, and identify reduction opportunities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
