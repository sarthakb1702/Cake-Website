import React from "react";
import { notFound } from "next/navigation";
import { ProductDetailView } from "../../../components/ProductDetailView";
import { PRODUCTS } from "../../../data/products";

interface DonutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DonutDetailPage({ params }: DonutDetailPageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((item) => item.id === id && item.category === "donut");

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
