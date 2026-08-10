// Base Product interface for shared properties
export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  imageUrl?: string;
  photoUrl?: string;
  bannerUrl?: string;
  url?: string;
  isEggless: boolean;
  leadTimeHours?: number;
  price?: number;
  category: string;
}

export type CakeShape = 'Round' | 'Heart' | 'Square' | 'Tiered' | string;

export interface WeightOption {
  weight: string;
  price: number;
  weightInGrams?: number;
}

export interface Product extends BaseProduct {
  availableShapes?: CakeShape[];
  shapes?: CakeShape[];
  weightOptions?: WeightOption[];
  weightVariants?: WeightOption[];
  weights?: string[];
  pricePerPiece?: number;
  minQuantity?: number;
  quantityStep?: number;
  minWeightGrams?: number;
  availableFlavors?: string[];
}