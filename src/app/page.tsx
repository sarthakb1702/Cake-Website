"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS } from "../data/products";
import { useCart } from "../context/CartContext";
import ThreeDBackgroundCake from "../components/ThreeDBackgroundCake";
import Footer from "../components/Footer";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "Signature Creation",
    headline: "Regal Chocolate Truffle Cake",
    description: "An indulgent, 3-layered Belgian chocolate cake with velvety ganache and soft 100% eggless sponge.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1600",
  },
  {
    id: 2,
    tag: "Classic Bestseller",
    headline: "Crimson Red Velvet Cake",
    description: "Silky cream cheese frosting layered over rich, cocoa-infused crimson sponge cake.",
    image: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?auto=format&fit=crop&q=80&w=1600",
  },
  {
    id: 3,
    tag: "Fresh Daily Bake",
    headline: "Double Chocolate Glazed Donut",
    description: "Soft, pillowy eggless donut dipped in rich dark chocolate glaze and topped with cocoa nibs.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1600",
  },
  {
    id: 4,
    tag: "Artisan Confection",
    headline: "Belgian Chocolate Fudge Blocks",
    description: "Slow-cooked, melt-in-your-mouth chocolate fudge made with pure butter and rich cocoa.",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1600",
  }
];

export default function HomePage() {
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredProducts = PRODUCTS.slice(0, 6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getProductPrice = (product: any): number => {
    if (typeof product.price === "number" && product.price > 0) return product.price;
    if (product.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions[0].price;
    }
    return product.pricePerPiece || 0;
  };

  return (
    <div className="min-h-screen bg-[#120B09] text-[#FFFDF9] font-sans animate-fade-in relative overflow-x-hidden selection:bg-[#EA580C] selection:text-white">
      {/* 1. Left-to-Right Scroll-Driven 3-Layered Cake Background */}
      <ThreeDBackgroundCake />

      {/* Main Content Layer */}
      <div className="relative z-10">
        
        {/* Full-Frame Slider Hero Section */}
        <section className="relative w-full h-[85vh] min-h-[500px] md:h-[75vh] md:min-h-[550px] overflow-hidden bg-black flex items-center">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.headline}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Dark Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120B09] via-transparent to-black/40 z-10 pointer-events-none" />

          {/* Hero Content Overlay */}
          <div className="z-10 relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
            <div className="grid grid-cols-1 grid-rows-1 max-w-xl">
              {HERO_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`col-start-1 row-start-1 space-y-4 md:space-y-6 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="inline-block">
                    <span className="bg-[#EA580C] text-white font-serif text-[10px] md:text-xs font-semibold px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-lg tracking-wider uppercase">
                      {slide.tag}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-white drop-shadow-md">
                    {slide.headline}
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-gray-200 font-light max-w-full md:max-w-lg leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <Link
                      href="/catalog"
                      className="inline-flex items-center justify-center w-full sm:w-auto bg-[#EA580C] hover:bg-orange-700 text-white font-semibold text-sm sm:text-base px-6 md:px-8 py-3 md:py-3.5 min-h-[44px] rounded-xl shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                      Order Now
                    </Link>
                    <Link
                      href="/orders"
                      className="inline-flex items-center justify-center w-full sm:w-auto border border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-6 md:px-8 py-3 md:py-3.5 min-h-[44px] rounded-xl backdrop-blur-md transition-all"
                    >
                      Your Orders
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 min-h-[24px] flex items-center justify-center ${
                  idx === currentSlide ? "w-8 bg-[#EA580C]" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </section>

        {/* 2. Feature Highlights Banner */}
        <section className="py-8 md:py-12 bg-[#1A0F0C]/90 backdrop-blur-md border-y border-[#331C15]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
            {[
              { icon: "🎂", title: "Custom Cake Designs", desc: "Bespoke creations tailored for every special event." },
              { icon: "🌱", title: "100% Eggless", desc: "Authentic recipes ensuring soft textures & rich flavors." },
              { icon: "⚡", title: "Express Pickup", desc: "Fast, scheduled pickup slots for optimal freshness." },
              { icon: "🍫", title: "Premium Cocoa", desc: "Crafted with pure Belgian chocolate & organic vanilla." }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-5 rounded-2xl bg-[#241713]/80 backdrop-blur-sm border border-[#422922] hover:border-[#EA580C]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center"
              >
                <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{item.icon}</div>
                <h3 className="font-bold text-xs md:text-base text-[#FFFDF9]">{item.title}</h3>
                <p className="text-[10px] md:text-xs text-[#BCAAA4] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Signature Bakes Showcase Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-0 mb-8">
            <div>
              <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider">Chef's Recommendations</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFDF9] mt-1">Signature Creations</h2>
            </div>
            <Link href="/catalog" className="text-sm font-bold text-[#EA580C] hover:underline flex items-center gap-1 min-h-[44px]">
              Explore Full Menu <span>→</span>
            </Link>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product: any) => {
              const price = getProductPrice(product);
              return (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-[#241713]/90 backdrop-blur-md border border-[#38231C] overflow-hidden shadow-xl hover:border-[#EA580C]/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 sm:h-52 md:h-56 w-full overflow-hidden bg-[#1A0F0C] relative">
                    <img
                      src={product.image || product.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.category && (
                      <span className="absolute top-3 left-3 bg-[#120B09]/80 backdrop-blur-md text-amber-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-[#FFFDF9] group-hover:text-[#EA580C] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#BCAAA4] mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description || "Freshly baked artisan confection made with premium ingredients."}
                      </p>
                    </div>
                    
                    <div className="mt-5 pt-3 border-t border-[#38231C] flex items-center justify-between">
                      <span className="text-base sm:text-lg font-extrabold text-[#FFFDF9]">₹{price}</span>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: price,
                            image: product.image || product.imageUrl,
                            category: product.category,
                          })
                        }
                        className="bg-[#EA580C] text-white px-4 py-2.5 min-h-[44px] rounded-lg text-xs font-semibold hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center"
                      >
                        Quick Add +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Customer Reviews Section */}
        <section className="bg-[#1A0F0C] py-12 md:py-16 border-t border-[#331C15]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFDF9]">Sweet Words From Our Customers</h2>
              <p className="text-xs text-[#BCAAA4] mt-2">Loved by cake enthusiasts and dessert lovers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { name: "Ananya Sharma", rating: 5, text: "The Belgian Chocolate Truffle cake was absolute perfection! Moist, rich, and 100% eggless. Pickup process was super smooth." },
                { name: "Rohit Verma", rating: 5, text: "Ordered donuts for an office event. Everyone loved the fresh textures and pricing discounts for bulk orders!" },
                { name: "Maya Patel", rating: 5, text: "The custom fudge slices are divine. Clean packaging, precise pickup time slots, and fantastic presentation." },
              ].map((review, i) => (
                <div key={i} className="bg-[#241713] p-4 sm:p-6 rounded-2xl border border-[#38231C] shadow-lg flex flex-col justify-between">
                  <p className="text-xs text-[#D7CCC8] leading-relaxed italic">"{review.text}"</p>
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-[#38231C]">
                    <div className="w-10 h-10 rounded-full bg-[#EA580C]/20 text-[#EA580C] flex items-center justify-center font-bold text-sm">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#FFFDF9]">{review.name}</h4>
                      <div className="text-[10px] text-[#EA580C] flex gap-0.5 mt-0.5">
                        {"★".repeat(review.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}