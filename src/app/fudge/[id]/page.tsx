import React from "react";
import { notFound } from "next/navigation";
import { ProductDetailView } from "../../../components/ProductDetailView";
import { PRODUCTS } from "../../../data/products";

interface FudgeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FudgeDetailPage({ params }: FudgeDetailPageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((item) => item.id === id && item.category === "fudge");

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
