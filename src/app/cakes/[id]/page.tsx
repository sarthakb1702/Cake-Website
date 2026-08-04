import React from "react";
import { notFound } from "next/navigation";
import { ProductDetailView } from "../../../components/ProductDetailView";
import { PRODUCTS } from "../../../data/products";

interface CakeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CakeDetailPage({ params }: CakeDetailPageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((item) => item.id === id && item.category === "cake");

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
