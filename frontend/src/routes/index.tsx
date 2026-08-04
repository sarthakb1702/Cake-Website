import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { StatsStrip } from "@/components/site/StatsStrip";
import { Bestsellers } from "@/components/site/Bestsellers";
import { Spotlight } from "@/components/site/Spotlight";
import { MenuExplorer } from "@/components/site/MenuExplorer";
import { CustomCakeTeaser } from "@/components/site/CustomCakeTeaser";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { Gallery } from "@/components/site/Gallery";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crumb & Co. — Artisan Cakes, Baked at Dawn" },
      {
        name: "description",
        content:
          "Small-batch artisan cakes, cupcakes and pastries from Crumb & Co. Handcrafted daily, custom designs, same-day delivery.",
      },
      { property: "og:title", content: "Crumb & Co. — Artisan Cakes, Baked at Dawn" },
      {
        property: "og:description",
        content:
          "Small-batch artisan cakes, cupcakes and pastries. Handcrafted daily, custom designs, same-day delivery.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "twitter:image",
        content:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
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
      </main>
      <Footer />
    </div>
  );
}
