import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { RotatingStamp } from "./decor";
import { cn } from "@/lib/utils";

const links = ["Shop", "Our Story", "Flavours", "Custom Cakes"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled && "bg-background/80 shadow-soft backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-5 py-4 md:px-10">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none font-black tracking-tight">
            Crumb <span className="text-rose">&</span> Co.
          </span>
          <span className="hidden text-[10px] font-semibold tracking-[0.3em] text-muted-foreground uppercase sm:block">
            Cake Shop
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {links.map((l, i) => (
            <a
              key={l}
              href="#shop"
              className={cn("nav-link", i === 0 ? "text-rose font-semibold" : "text-chocolate")}
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:gap-5">
          <RotatingStamp className="hidden text-chocolate xl:block" />
          <a href="#delivery" className="nav-link hidden text-sm font-medium text-chocolate md:block">
            Delivery
          </a>
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full bg-chocolate px-4 py-2.5 text-sm font-semibold text-cream-white transition-transform hover:scale-105"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[11px] font-bold">
              3
            </span>
          </button>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-blush px-6 py-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl font-black text-chocolate">Crumb & Co.</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-14 flex flex-col gap-2">
              {[...links, "Delivery"].map((l, i) => (
                <motion.a
                  key={l}
                  href="#shop"
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="font-display text-5xl font-black text-chocolate"
                >
                  {l}
                </motion.a>
              ))}
            </nav>
            <div className="absolute bottom-10 left-6 right-6">
              <button className="w-full rounded-full bg-chocolate py-4 font-semibold text-cream-white">
                Order Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
