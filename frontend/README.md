# Crumb & Co. Showcase

Build a visually striking, UI-heavy marketing website for a modern artisan cake shop called **"Crumb & Co."** using **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion**. This is a frontend-only build — no backend, no auth, no real payment logic. Use mock/placeholder data and high-quality stock/AI-generated food photography (rendered cake images, close-up textures, hands holding cakes/cupcakes) sourced from Unsplash/Pexels-style URLs so every image looks premium and editorial, never generic or clipart-like.

### Overall Art Direction
The site should feel like a boutique dessert brand's flagship page — playful, confident, and highly designed, NOT a generic template. Think Awwwards-style bakery/food brand site: bold hand-drawn-feeling display typography mixed with a clean grotesk sans, oversized hero imagery with a colored arch/blob backdrop behind the product shot, small sparkle/star doodle icons scattered as accents, a rounded pill-shaped price/badge tag floating on hero images, and a dark charcoal footer/product-card contrast block. The layout should feel minimalist in structure (generous whitespace, clear grid) but maximalist in personality (funky color pops, playful icons, layered imagery).

### Color Palette (funky but tasteful — define as Tailwind theme extension)
- `--bg-cream: #FFF8F1` (primary background, warm off-white)
- `--pink-primary: #F4A6B7` (blush pink — hero backdrop arch, primary accent)
- `--pink-deep: #E8607D` (CTA buttons, highlight text, badges)
- `--chocolate: #3A2A24` (dark cards, footer, body copy on light bg)
- `--butter-yellow: #F6C453` (secondary accent — for a category or badge)
- `--pistachio: #A8C686` (tertiary accent for variety in product cards)
- `--cream-white: #FFFFFF`
- `--ink: #1E1B18` (near-black text)
Use 4–5 colors max per viewport so it stays cohesive, not chaotic. Pink is the hero/brand color; yellow and pistachio are used sparingly on product category cards for variety, echoing how the reference image uses different pastel backgrounds per flavor.

### Typography
- **Display/Headline font:** A bold, slightly quirky, rounded or hand-set display typeface (use "Fraunces" or "Clash Display" or "Bricolage Grotesque" from Google Fonts/Fontshare) — big, tight letter-spacing, mixed-case with personality, used for hero headline and section titles at 56–96px on desktop.
- **Body/UI font:** A clean modern grotesk like "Inter" or "General Sans" for nav, body copy, buttons, labels — highly legible at smaller sizes.
- Headlines should sometimes use a "broken grid" treatment — wrap text across multiple short lines like a poem/manifesto (e.g. "LIFE'S TOO SHORT TO EAT / BORING CAKE") rather than one long line, with small star/sparkle SVG icons floating between words as micro-decoration.

### Global UI Details
- Rounded corners everywhere (16–32px radius) — pill-shaped buttons and nav items, rounded product cards, rounded image containers.
- Floating sparkle/star/diamond doodle icons (simple line-art SVGs) scattered near headlines and product shots as ambient decoration — subtle, not overused.
- Soft drop shadows only on interactive/elevated elements (cards, floating badges), otherwise flat design.
- Micro-interactions: buttons scale/lighten on hover, product cards lift with a soft shadow and image zoom (scale 1.05) on hover, nav underline slides in on hover, price badges gently pulse or bob using Framer Motion.
- Circular rotating badge (like a "stamp" logo — e.g. "FRESH DAILY • HANDCRAFTED •" text on a circle) near the logo/nav, animated to slowly rotate on scroll or infinitely.
- Use a subtle grain/noise texture overlay on hero background for a premium editorial feel (optional CSS background-blend).

### Page Sections (build all of these as distinct, fully designed components)

1. **Navbar**
   - Left: text logo "Crumb & Co." in display font, with the tagline "Cake Shop" in small caps beside/below it.
   - Center-left nav links: Shop, Our Story, Flavours, Custom Cakes — with one link (e.g. "Shop") styled in the accent pink to mirror the reference's colored nav item.
   - Right: rotating circular stamp badge, "Delivery" link, and a "Cart" pill button with an item-count bubble in pink.
   - Sticky nav with a subtle blur/backdrop on scroll.

2. **Hero Section**
   - Two-column layout. Left: oversized broken-line manifesto headline ("LIFE'S TOO SHORT / FOR BORING CAKE" style), a short supporting paragraph with a small icon, and two CTA buttons ("Order Now" filled pink pill, "Explore Flavours" outline pill).
   - Right: large pink arch/blob shape as a backdrop, with a hero product image (a hand holding an elaborately decorated cake slice or cupcake, drop shadow, layered above the arch) breaking outside the shape's bounds for depth. Include a floating white rounded card with a product name ("Velvet Bloom"), short description, and a circular price tag badge in pink, positioned over the hero image like the reference.
   - Small left/right arrow navigation dots below the hero image to imply a carousel of hero products.

3. **Trust/Stats Strip** — thin horizontal strip with 3–4 short stats or trust badges (e.g. "100% Fresh Ingredients," "500+ Cakes Baked Weekly," "Same-Day Delivery") with small icons, minimal style, dividers between items.

4. **Featured Categories Grid ("Our Bestsellers")**
   - A responsive grid of 4 product cards mimicking the bottom strip of the reference image: each card has a distinct pastel or dark background color, a product cutout image (cupcake/cake slice on a cone-like stand or plate) breaking the top edge of the card, product name in bold display font, and a circular price badge bottom-right. Vary card background colors across pink, dark chocolate, pistachio, and butter yellow for the funky multi-color effect from the reference.
   - Cards should lift and glow slightly on hover.

5. **Product Spotlight / "Cake of the Month"**
   - Full-width dark chocolate-background section with a large product photo on one side, and on the other side a bold headline, ingredient/flavor description, a pill "Add to Cart" button, and small nutrition/allergen icons.

6. **Menu / Flavour Explorer**
   - A filterable tab bar (Cakes, Cupcakes, Pastries, Custom) with a horizontally scrollable or grid product carousel below — each item as a compact card with image, name, short tag, and price.

7. **Custom Cake Builder Teaser**
   - A playful interactive-looking section (visual only) showing 3 steps (Choose flavour → Pick design → Add message) as connected numbered cards with icons, ending in a CTA "Start Designing Your Cake" button.

8. **Our Story / About**
   - Split layout: image collage (2–3 overlapping rounded images of the bakery/baker at work) on one side, warm narrative copy with a hand-drawn-style underline accent on a key phrase, on the other.

9. **Testimonials**
   - Horizontally scrollable cards with customer photo, star rating, short quote, and name — rounded cards with soft pastel backgrounds alternating colors.

10. **Instagram/Gallery Strip**
    - A tight grid of square product photography thumbnails with a subtle hover overlay (heart icon + likes), framed by a "Follow us @crumbandco" heading.

11. **Newsletter/CTA Banner**
    - Bold pink full-width banner with a short headline ("Get 10% Off Your First Order"), email input styled as a pill, and a filled dark button.

12. **Footer**
    - Dark chocolate background. Columns for Shop links, Company, Support, and a Newsletter/social icons block. Large faint outline wordmark "Crumb & Co." at the very bottom for brand presence, similar to premium editorial footers.

### Motion & Responsiveness
- Use Framer Motion for scroll-triggered fade/slide-ins on each section, staggered card reveals in grids, and a subtle parallax on the hero product image.
- Fully responsive: stack hero into single column on mobile, cards go to 2-column then 1-column grid, nav collapses into a rounded hamburger menu with a full-screen colorful mobile menu overlay matching the brand palette.

### Deliverable Expectations
- Build this as production-quality component structure (`components/Navbar.tsx`, `Hero.tsx`, `Bestsellers.tsx`, `Spotlight.tsx`, `MenuExplorer.tsx`, `CustomCakeTeaser.tsx`, `About.tsx`, `Testimonials.tsx`, `Gallery.tsx`, `Newsletter.tsx`, `Footer.tsx`), styled entirely with Tailwind using the custom theme colors/fonts defined above.
- Prioritize visual polish and attention to detail (spacing rhythm, consistent radius scale, consistent shadow scale) over feature complexity — this is a portfolio-grade landing experience, not a full e-commerce app.
- Do not add real backend calls, cart logic, or payment integration — all buttons and forms are visual/UI only for now, ready to be wired up later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8faa4463-9920-4fb5-a556-ed882f4a43a4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
