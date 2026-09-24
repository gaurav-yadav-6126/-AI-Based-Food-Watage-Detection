'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WasteData } from '@/lib/types';
import { format, parseISO, startOfWeek, startOfMonth } from 'date-fns';

interface WasteTrendsChartProps {
  wasteData: WasteData[];
}

type Period = 'daily' | 'weekly' | 'monthly';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function WasteTrendsChart({ wasteData }: WasteTrendsChartProps) {
  const [period, setPeriod] = useState<Period>('daily');

  const { chartData, foodTypes } = useMemo(() => {
    const dataMap = new Map<string, { name: string; timestamp: number; [key: string]: any }>();
    const allFoodTypes = new Set<string>();

    wasteData.forEach(item => {
      allFoodTypes.add(item.foodType);
      const date = parseISO(item.timestamp);
      const quantity = parseFloat(item.estimatedQuantity.match(/(\d+(\.\d+)?)/)?.[0] || '0');
      let key: string;
      let sortTimestamp: number;

      if (period === 'daily') {
        key = format(date, 'MMM d');
        sortTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      } else if (period === 'weekly') {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        key = format(weekStart, 'MMM d');
        sortTimestamp = weekStart.getTime();
      } else { // monthly
        const monthStart = startOfMonth(date);
        key = format(monthStart, 'MMM yyyy');
        sortTimestamp = monthStart.getTime();
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { name: key, timestamp: sortTimestamp });
      }
      
      const periodData = dataMap.get(key)!;
      periodData[item.foodType] = (periodData[item.foodType] || 0) + quantity;
    });
    
    const sortedData = Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    return { chartData: sortedData, foodTypes: Array.from(allFoodTypes) };
  }, [wasteData, period]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Waste Trends</CardTitle>
                <CardDescription>Total waste quantity (in grams) over time by food type.</CardDescription>
            </div>
            <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3 sm:flex sm:w-auto">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-6 min-w-0">
        {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}g`} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                {foodTypes.map((foodType, index) => (
                    <Bar 
                        key={foodType} 
                        dataKey={foodType} 
                        stackId="a" 
                        fill={COLORS[index % COLORS.length]} 
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                ))}
              </BarChart>
            </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Not enough data to display trends.</p>
            <p className="text-sm">Log more waste over time to see trends.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
