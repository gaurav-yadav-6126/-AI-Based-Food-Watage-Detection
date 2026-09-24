'use client';

import React from 'react';
import { useWasteData } from '@/hooks/use-waste-data';
import ImageUploadForm from '@/components/dashboard/image-upload-form';
import WasteLogTable from '@/components/dashboard/waste-log-table';
import StatsCards from '@/components/dashboard/stats-cards';
import WasteOverviewChart from '@/components/dashboard/waste-overview-chart';
import { Skeleton } from '@/components/ui/skeleton';
import WasteTrendsChart from '@/components/dashboard/waste-trends-chart';
import AiWasteSummary from '@/components/dashboard/ai-waste-summary';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function DashboardPage() {
  const { wasteData, addWasteEntry, isLoading, clearWasteData, loadSampleData } = useWasteData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-[400px] col-span-4" />
          <Skeleton className="h-[400px] col-span-3" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold font-headline">Kitchen Waste Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time waste detection, volume tracking, and AI insights.</p>
        </div>
        <div className="flex items-center gap-2">
          {wasteData.length === 0 && (
            <Button variant="outline" size="sm" onClick={loadSampleData} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Load Sample Demo Data
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 rounded-lg shadow-sm min-w-0" >
        <div className="w-full space-y-6 min-w-0">
          <StatsCards wasteData={wasteData} />

          <AiWasteSummary wasteData={wasteData} />

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 min-w-0">
              <ImageUploadForm onWasteAdd={addWasteEntry} />
            </div>
            <div className="lg:col-span-3 min-w-0">
               <WasteTrendsChart wasteData={wasteData} />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 min-w-0">
                <WasteOverviewChart wasteData={wasteData} />
            </div>
             <div className="lg:col-span-3 min-w-0">
              <WasteLogTable wasteData={wasteData} clearWasteData={clearWasteData}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
