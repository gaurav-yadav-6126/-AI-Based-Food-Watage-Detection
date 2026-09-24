'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WasteData } from '@/lib/types';

const STORAGE_KEY = 'food-waste-logs';

export const SAMPLE_WASTE_DATA: WasteData[] = [
  {
    id: 'sample-1',
    foodType: 'steamed rice',
    estimatedQuantity: '220g',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'sample-2',
    foodType: 'mixed salad',
    estimatedQuantity: '140g',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'sample-3',
    foodType: 'grilled chicken',
    estimatedQuantity: '180g',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'sample-4',
    foodType: 'artisan bread',
    estimatedQuantity: '110g',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'sample-5',
    foodType: 'pasta marinara',
    estimatedQuantity: '250g',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'sample-6',
    foodType: 'french fries',
    estimatedQuantity: '160g',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=400&auto=format&fit=crop',
  },
];

export function useWasteData() {
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData !== null) {
      try {
        setWasteData(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse waste data from localStorage:', error);
        setWasteData(SAMPLE_WASTE_DATA);
      }
    } else {
      setWasteData(SAMPLE_WASTE_DATA);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_WASTE_DATA));
      } catch (e) {
        console.error('Failed to initialize sample data in localStorage:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const addWasteEntry = useCallback((entry: Omit<WasteData, 'id' | 'timestamp'>) => {
    const newEntry: WasteData = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    setWasteData(prev => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save waste data to localStorage:', error);
      }
      return updated;
    });
    return newEntry;
  }, []);

  const clearWasteData = useCallback(() => {
    setWasteData([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadSampleData = useCallback(() => {
    setWasteData(SAMPLE_WASTE_DATA);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_WASTE_DATA));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    wasteData,
    isLoading,
    addWasteEntry,
    clearWasteData,
    loadSampleData,
  };
}
