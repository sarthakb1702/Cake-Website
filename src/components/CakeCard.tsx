"use client";

import React from "react";
import { ProductCard } from "./ProductCard";

interface CakeProps {
  id: string;
  name: string;
  image: string;
  description: string;
  basePrice: number;
  weights?: string[] | string;
  shapes?: string[] | string;
  weightVariants?: any[];
  weightOptions?: any[];
}

export const CakeCard = (props: CakeProps) => {
  const productPayload = {
    id: props.id,
    name: props.name,
    image: props.image,
    description: props.description,
    price: props.basePrice,
    category: "cake",
    weights: props.weights,
    shapes: props.shapes,
    weightVariants: props.weightVariants || props.weightOptions,
  };

  return <ProductCard product={productPayload} />;
};