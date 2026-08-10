"use client";

import React from "react";
import { ProductCard } from "./ProductCard";

interface DonutProps {
  id: string;
  name: string;
  image: string;
  description: string;
  basePricePerPiece?: number;
}

export const DonutCard = (props: DonutProps) => {
  const productPayload = {
    id: props.id,
    name: props.name,
    image: props.image,
    description: props.description,
    price: props.basePricePerPiece || 80,
    pricePerPiece: props.basePricePerPiece || 80,
    category: "donut",
  };

  return <ProductCard product={productPayload} />;
};