"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#0C0706] text-[#FFFDF9] border-t border-[#331C15] pt-12 md:pt-16 pb-8 md:pb-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        
        {/* Brand & About */}
        <div className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-amber-100">SweetStudio</h3>
          <p className="text-xs text-amber-200/70 leading-relaxed">
            Crafting 100% eggless artisan cakes, gourmet donuts, and slow-cooked chocolate fudge daily. Pure ingredients, timeless passion.
          </p>
          <span className="inline-block bg-[#EA580C] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            100% Eggless Bakery
          </span>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-sm text-amber-100 mb-4 uppercase tracking-wider">Explore Menu</h4>
          <ul className="space-y-3 text-xs text-amber-200/80">
            <li><Link href="/catalog" className="inline-block py-1 hover:text-[#EA580C] transition-colors">Signature Cakes</Link></li>
            <li><Link href="/catalog" className="inline-block py-1 hover:text-[#EA580C] transition-colors">Glazed Donuts</Link></li>
            <li><Link href="/catalog" className="inline-block py-1 hover:text-[#EA580C] transition-colors">Artisan Fudge Blocks</Link></li>
            <li><Link href="/catalog" className="inline-block py-1 hover:text-[#EA580C] transition-colors">Custom Orders</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-semibold text-sm text-amber-100 mb-4 uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-3 text-xs text-amber-200/80">
            <li><Link href="/orders" className="inline-block py-1 hover:text-[#EA580C] transition-colors">Track Order Status</Link></li>
            <li><Link href="/orders" className="inline-block py-1 hover:text-[#EA580C] transition-colors">Store Pickup Slots</Link></li>
            <li><a href="#reviews" className="inline-block py-1 hover:text-[#EA580C] transition-colors">Customer Reviews</a></li>
            <li><span className="inline-block py-1 text-amber-200/50">FAQ & Support</span></li>
          </ul>
        </div>

        {/* Store Hours & Location */}
        <div className="space-y-3 text-xs text-amber-200/80">
          <h4 className="font-semibold text-sm text-amber-100 mb-4 uppercase tracking-wider">Bakery Hours</h4>
          <p>📍 Main Boutique & Studio Kitchen</p>
          <p>⏰ Mon - Sun: 9:00 AM - 10:30 PM</p>
          <p>📞 Phone: +91 (800) 555-BAKE</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center text-center sm:text-left justify-between gap-3 sm:gap-0 text-[11px] text-amber-200/50">
        <p>© {new Date().getFullYear()} SweetStudio Bakery. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer py-1">Privacy Policy</span>
          <span className="hover:underline cursor-pointer py-1">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}