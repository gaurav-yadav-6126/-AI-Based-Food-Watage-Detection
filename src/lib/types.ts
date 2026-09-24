export interface WasteData {
  id: string;
  foodType: string;
  estimatedQuantity: string;
  timestamp: string;
  imageUrl?: string;
}

export interface WasteReductionTip {
  id: string;
  title: string;
  description: string;
  category: 'inventory' | 'preparation' | 'storage' | 'portioning';
}
