import { Product } from '../types';

export const PRODUCTS: Product[] = [
  // 🎂 CAKES (Shape & Weight selection only)
  {
    id: 'cake-belgian-truffle',
    name: 'Belgian Dark Chocolate Truffle',
    description: 'Rich, smooth 100% eggless Belgian chocolate layered with dark cocoa sponge.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800',
    isEggless: true,
    category: 'cake',
    leadTimeHours: 3,
    availableShapes: ['Round', 'Heart', 'Square'],
    weightOptions: [
      { weight: '0.5 kg', price: 500 },
      { weight: '1.0 kg', price: 950 },
      { weight: '2.0 kg', price: 1800 },
    ],
  },
  {
    id: 'cake-red-velvet',
    name: 'Red Velvet Cream Cheese Cake',
    description: 'Classic crimson velvet sponge layers paired with rich cream cheese frosting.',
    image: 'https://images.unsplash.com/photo-1586788680404-32824795b6b3?auto=format&fit=crop&q=80&w=800',
    isEggless: true,
    category: 'cake',
    leadTimeHours: 3,
    availableShapes: ['Round', 'Heart'],
    weightOptions: [
      { weight: '0.5 kg', price: 550 },
      { weight: '1.0 kg', price: 1050 },
      { weight: '2.0 kg', price: 2000 },
    ],
  },

  // 🍩 DONUTS (Min 6 pieces, steps of 6)
  {
    id: 'donut-glazed-box',
    name: 'Classic Chocolate Glazed Donuts',
    description: 'Soft, fluffy eggless donuts dipped in Belgian milk chocolate glaze.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800',
    isEggless: true,
    category: 'donut',
    leadTimeHours: 2,
    minQuantity: 6,
    quantityStep: 6,
    pricePerPiece: 70, // Total box of 6 = ₹420
    availableFlavors: ['Dark Choco', 'White Choco Sprinkle', 'Hazelnut Crunch'],
  },

  // 🍫 FUDGE (Min 250g)
  {
    id: 'fudge-walnut-choco',
    name: 'Roasted Walnut Dark Fudge',
    description: 'Dense, slow-cooked dark chocolate fudge packed with slow-roasted walnuts.',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&q=80&w=800',
    isEggless: true,
    category: 'fudge',
    leadTimeHours: 2,
    minWeightGrams: 250,
    weightOptions: [
      { weight: '250g', weightInGrams: 250, price: 300 },
      { weight: '500g', weightInGrams: 500, price: 580 },
      { weight: '1 kg', weightInGrams: 1000, price: 1100 },
    ],
  },
];