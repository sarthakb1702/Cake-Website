import React from "react";
import { Hero } from "../components/site/Hero";
import { StatsStrip } from "../components/site/StatsStrip";
import { Bestsellers } from "../components/site/Bestsellers";
import { Spotlight } from "../components/site/Spotlight";
import { MenuExplorer } from "../components/site/MenuExplorer";
import { CustomCakeTeaser } from "../components/site/CustomCakeTeaser";
import { About } from "../components/site/About";
import { Testimonials } from "../components/site/Testimonials";
import { Gallery } from "../components/site/Gallery";
import { Newsletter } from "../components/site/Newsletter";
import { Footer } from "../components/site/Footer";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-rose selection:text-white">
      <Hero />
      <StatsStrip />
      <Bestsellers />
      <Spotlight />
      <MenuExplorer />
      <CustomCakeTeaser />
      <About />
      <Testimonials />
      <Gallery />
      <Newsletter />
      <Footer />
    </div>
  );
}