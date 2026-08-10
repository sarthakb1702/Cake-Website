"use client";

import React from "react";
import { ProductCard } from "./ProductCard";

interface FudgeProps {
  id: string;
  name: string;
  image: string;
  description: string;
  pricePer250g?: number;
  price?: number;
  weightVariants?: any[];
  weightOptions?: any[];
  weights?: string[] | string;
}

export const FudgeCard = (props: FudgeProps) => {
  const productPayload = {
    id: props.id,
    name: props.name,
    image: props.image,
    description: props.description,
    price: props.pricePer250g || props.price || 300,
    category: "fudge",
    weights: props.weights,
    weightVariants: props.weightVariants || props.weightOptions,
  };

  return <ProductCard product={productPayload} />;
};