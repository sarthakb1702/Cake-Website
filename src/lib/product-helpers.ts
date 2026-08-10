import { Product, WeightOption } from "@/types";

export interface SafeProductMetadata {
  weightVariants: WeightOption[];
  defaultWeight: string;
  weightsList: string[];
  displayWeights: string;
  shapesList: string[];
  displayShapes: string;
  basePrice: number;
}

export function generateDefaultWeightVariants(category: string, basePrice: number): WeightOption[] {
  const cat = (category || "").toLowerCase();
  const safeBase = basePrice > 0 ? basePrice : (cat === "fudge" ? 300 : cat.includes("cake") ? 500 : 70);

  if (cat === "fudge") {
    return [
      { weight: "250g", price: safeBase },
      { weight: "500g", price: Math.round(safeBase * 1.8) },
      { weight: "750g", price: Math.round(safeBase * 2.6) },
      { weight: "1kg", price: Math.round(safeBase * 3.4) },
    ];
  }

  if (cat === "cake" || cat === "cakes") {
    return [
      { weight: "0.5 kg", price: safeBase },
      { weight: "1 kg", price: Math.round(safeBase * 1.8) },
      { weight: "1.5 kg", price: Math.round(safeBase * 2.6) },
      { weight: "2 kg", price: Math.round(safeBase * 3.4) },
    ];
  }

  if (cat === "donut" || cat === "donuts") {
    return [
      { weight: "1 pc", price: safeBase },
      { weight: "6 pcs", price: 300 },
    ];
  }

  return [{ weight: "Standard", price: safeBase }];
}

export function generateDefaultShapes(category: string): string[] {
  const cat = (category || "").toLowerCase();
  if (cat === "cake" || cat === "cakes") {
    return ["Round", "Heart", "Square"];
  }
  return [];
}

export function getSafeProductMetadata(product: any): SafeProductMetadata {
  const category = (product?.category || "").toLowerCase();
  const basePrice =
    typeof product?.price === "number" && product.price > 0
      ? product.price
      : typeof product?.pricePerPiece === "number" && product.pricePerPiece > 0
      ? product.pricePerPiece
      : typeof product?.pricePer250g === "number" && product.pricePer250g > 0
      ? product.pricePer250g
      : 300;

  // 1. Weight variants parsing across ALL Firestore schemas
  let weightVariants: WeightOption[] = [];

  if (Array.isArray(product?.weightVariants) && product.weightVariants.length > 0) {
    weightVariants = product.weightVariants.map((v: any) =>
      typeof v === "object" && v !== null && v.weight
        ? { weight: String(v.weight), price: Number(v.price) || basePrice }
        : { weight: String(v), price: basePrice }
    );
  } else if (Array.isArray(product?.weightOptions) && product.weightOptions.length > 0) {
    weightVariants = product.weightOptions.map((v: any) =>
      typeof v === "object" && v !== null && v.weight
        ? { weight: String(v.weight), price: Number(v.price) || basePrice }
        : { weight: String(v), price: basePrice }
    );
  } else if (Array.isArray(product?.weights) && product.weights.length > 0) {
    weightVariants = product.weights.map((w: any) => ({ weight: String(w), price: basePrice }));
  } else if (typeof product?.weights === "string" && product.weights.trim().length > 0) {
    const splitWeights = product.weights.split(",").map((w: string) => w.trim()).filter(Boolean);
    weightVariants = splitWeights.map((w: string) => ({ weight: w, price: basePrice }));
  } else if (typeof product?.weight === "string" && product.weight.trim().length > 0) {
    const splitWeights = product.weight.split(",").map((w: string) => w.trim()).filter(Boolean);
    weightVariants = splitWeights.map((w: string) => ({ weight: w, price: basePrice }));
  } else if (Array.isArray(product?.weight) && product.weight.length > 0) {
    weightVariants = product.weight.map((w: any) => ({ weight: String(w), price: basePrice }));
  }

  if (weightVariants.length === 0) {
    weightVariants = generateDefaultWeightVariants(category, basePrice);
  }

  const weightsList = weightVariants.map((v) => v.weight);
  const defaultWeight = weightVariants[0]?.weight || (["cake", "cakes", "fudge"].includes(category) ? "500g" : "1 pc");
  const displayWeights = weightsList.join(", ");

  // 2. Shape parsing across ALL Firestore schemas
  let shapesList: string[] = [];

  if (Array.isArray(product?.shapes) && product.shapes.length > 0) {
    shapesList = product.shapes.map(String);
  } else if (Array.isArray(product?.availableShapes) && product.availableShapes.length > 0) {
    shapesList = product.availableShapes.map(String);
  } else if (Array.isArray(product?.shape) && product.shape.length > 0) {
    shapesList = product.shape.map(String);
  } else if (typeof product?.shapes === "string" && product.shapes.trim().length > 0) {
    shapesList = product.shapes.split(",").map((s: string) => s.trim()).filter(Boolean);
  } else if (typeof product?.availableShapes === "string" && product.availableShapes.trim().length > 0) {
    shapesList = product.availableShapes.split(",").map((s: string) => s.trim()).filter(Boolean);
  } else if (typeof product?.shape === "string" && product.shape.trim().length > 0) {
    shapesList = product.shape.split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  if (shapesList.length === 0 && (category === "cake" || category === "cakes")) {
    shapesList = ["Round", "Heart", "Square"];
  }

  const displayShapes = shapesList.join(", ");

  return {
    weightVariants,
    defaultWeight,
    weightsList,
    displayWeights,
    shapesList,
    displayShapes,
    basePrice: weightVariants[0]?.price || basePrice,
  };
}
