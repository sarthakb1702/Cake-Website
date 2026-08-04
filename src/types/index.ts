// Base Product interface for shared properties
export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  isEggless: true; // Enforces 100% eggless across the platform
  leadTimeHours: number; // Set to 2-3 hours
}

// Cake: Weight & Shape options only (No size selection)
export type CakeShape = 'Round' | 'Heart' | 'Square' | 'Tiered';

export interface CakeWeightOption {
  weight: string; // e.g., '0.5 kg', '1.0 kg', '2.0 kg'
  price: number;
}

export interface CakeProduct extends BaseProduct {
  category: 'cake';
  availableShapes: CakeShape[];
  weightOptions: CakeWeightOption[];
}

// Donut: Sold in minimum 6 pieces (increments of 6)
export interface DonutProduct extends BaseProduct {
  category: 'donut';
  minQuantity: 6;
  quantityStep: 6;
  pricePerPiece: number;
  availableFlavors?: string[];
}

// Fudge: Sold by weight with minimum 250 grams
export interface FudgeWeightOption {
  weight: string; // e.g., '250g', '500g', '1 kg'
  weightInGrams: number;
  price: number;
}

export interface FudgeProduct extends BaseProduct {
  category: 'fudge';
  minWeightGrams: 250;
  weightOptions: FudgeWeightOption[];
}

// Union Type for any product in store
export type Product = CakeProduct | DonutProduct | FudgeProduct;