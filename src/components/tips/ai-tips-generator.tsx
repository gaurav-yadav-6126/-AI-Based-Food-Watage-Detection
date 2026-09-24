'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, ChefHat, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateWasteReductionTips } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useWasteData } from '@/hooks/use-waste-data';

const RESTAURANT_TYPES = [
  'Casual Dining',
  'Buffet / Self-Service',
  'Italian Trattoria',
  'Fast Casual & Burgers',
  'Bakery & Cafe',
  'Fine Dining',
];

export default function AiTipsGenerator() {
  const { wasteData } = useWasteData();
  const [restaurantType, setRestaurantType] = useState('Casual Dining');
  const [menuItems, setMenuItems] = useState('Pastas, Rice bowls, Grilled poultry, Fresh salads');
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUseLoggedItems = () => {
    if (wasteData.length > 0) {
      const uniqueItems = Array.from(new Set(wasteData.map(w => w.foodType))).slice(0, 6);
      setMenuItems(uniqueItems.join(', '));
      toast({
        title: 'Auto-filled from Logs',
        description: `Imported: ${uniqueItems.join(', ')}`,
      });
    } else {
      toast({
        title: 'No Logs Yet',
        description: 'No waste logs found to import. You can type your menu items manually.',
      });
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Calculate top waste analytics string
      let analytics = 'General restaurant food waste reduction.';
      if (wasteData.length > 0) {
        const totalQty = wasteData.reduce((acc, i) => {
          const m = i.estimatedQuantity.match(/(\d+(\.\d+)?)/);
          return acc + (m ? parseFloat(m[0]) : 0);
        }, 0);
        analytics = `Logged ${wasteData.length} waste events totaling ~${totalQty.toFixed(0)}g across ${Array.from(new Set(wasteData.map(i => i.foodType))).join(', ')}.`;
      }

      const result = await generateWasteReductionTips({
        restaurantType,
        menuItems: menuItems || 'Standard restaurant menu items',
        wasteAnalytics: analytics,
      });

      if (result && result.tips && result.tips.length > 0) {
        setTips(result.tips);
        toast({
          title: 'Custom Tips Generated',
          description: `Generated ${result.tips.length} tailored recommendations.`,
        });
      }
    } catch (error: any) {
      console.error('Error generating tips:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate tips at this moment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 shadow-xl overflow-hidden mb-12">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-headline">Generate Tailored AI Reduction Strategies</CardTitle>
            <CardDescription className="text-base mt-1">
              Tell Gemini about your restaurant type and menu to generate hyper-relevant operational tips.
            </CardDescription>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Restaurant Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RESTAURANT_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRestaurantType(type)}
                  className={`text-xs p-2.5 rounded-lg border transition-all text-left font-medium ${
                    restaurantType === type
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-border hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Menu Items / Ingredients</label>
              {wasteData.length > 0 && (
                <button
                  type="button"
                  onClick={handleUseLoggedItems}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Auto-fill from Waste Logs
                </button>
              )}
            </div>
            <Input
              value={menuItems}
              onChange={(e) => setMenuItems(e.target.value)}
              placeholder="e.g. Steamed Rice, Chicken, Mixed Salads, Bread rolls"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Mention the primary ingredients or dishes you want to reduce waste on.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full sm:w-auto gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Consulting AI Model...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Tailored Tips
              </>
            )}
          </Button>
        </div>

        {tips.length > 0 && (
          <div className="mt-6 pt-6 border-t space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-semibold font-headline text-lg">Personalized AI Recommendations for {restaurantType}</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl border bg-card/60 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
