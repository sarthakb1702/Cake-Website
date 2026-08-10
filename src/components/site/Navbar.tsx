"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, ShoppingBag, X, User as UserIcon, Shield, LogOut, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const links = [
  { name: "Catalog", href: "/catalog" },
  { name: "Cakes", href: "/cakes" },
  { name: "Donuts", href: "/donuts" },
  { name: "Fudge", href: "/fudge" },
  { name: "My Orders", href: "/orders" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { cart } = useCart();
  const { currentUser, userRole, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdminRoute = Boolean(pathname?.startsWith("/admin"));
  const hideCart = userRole === "admin" || isAdminRoute;

  const totalCartItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMyOrdersClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to view your past orders.");
      router.push("/login?redirect=/orders");
    } else {
      router.push("/orders");
    }
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      router.push("/login");
    } else {
      router.push("/profile");
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to access your cart.");
      router.push("/login?redirect=/cart");
    } else {
      router.push("/cart");
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const adminLinks = [
    { name: "Manage Products", href: "/admin" },
    { name: "Orders", href: "/admin" },
    { name: "Subscribers", href: "/admin" },
    { name: "View Storefront", href: "/" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled && "bg-background/85 shadow-soft backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-5 py-4 md:px-10">
        <Link href={isAdminRoute ? "/admin" : "/"} className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none font-black tracking-tight text-chocolate">
            Shreya's <span className="text-rose">Home</span> Bakery
          </span>
          <span className="hidden text-[10px] font-semibold tracking-[0.3em] text-muted-foreground uppercase sm:block">
            {isAdminRoute ? "Admin CMS Panel" : "Bakery & Confections"}
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {isAdminRoute ? (
            adminLinks.map((l) => (
              <Link
                key={l.name}
                href={l.href}
                className="nav-link font-bold text-chocolate hover:text-rose transition-colors"
              >
                {l.name}
              </Link>
            ))
          ) : (
            links.map((l, i) => {
              if (l.href === "/orders") {
                return (
                  <button
                    key={l.name}
                    type="button"
                    onClick={handleMyOrdersClick}
                    className="nav-link text-chocolate hover:text-rose transition-colors cursor-pointer"
                  >
                    {l.name}
                  </button>
                );
              }
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={cn("nav-link", i === 0 ? "text-rose font-semibold" : "text-chocolate")}
                >
                  {l.name}
                </Link>
              );
            })
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:gap-4">
          {/* Admin Panel shortcut */}
          {!isAdminRoute && currentUser && userRole === "admin" && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 rounded-full bg-butter/30 px-3.5 py-2 text-xs font-bold text-chocolate border border-butter/60 hover:bg-butter transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-chocolate" />
              Admin Panel
            </Link>
          )}

          {/* My Orders Button */}
          {!isAdminRoute && (
            <button
              type="button"
              onClick={handleMyOrdersClick}
              className="group flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-bold text-chocolate hover:bg-blush transition-colors cursor-pointer"
              title="My Orders"
            >
              <Receipt className="h-4 w-4 text-chocolate group-hover:text-rose" />
              <span className="hidden sm:inline">My Orders</span>
            </button>
          )}

          {/* User Profile / Sign In Button */}
          <button
            type="button"
            onClick={handleProfileClick}
            aria-label="User Profile"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-chocolate hover:bg-blush transition-colors cursor-pointer"
            title={currentUser ? "User Profile" : "Sign In"}
          >
            <UserIcon className="h-4 w-4 text-chocolate" />
          </button>

          {/* Cart Button */}
          {!hideCart && (
            <button
              onClick={handleCartClick}
              type="button"
              className="group inline-flex items-center gap-2 rounded-full bg-chocolate px-4 py-2.5 text-sm font-semibold text-cream-white transition-transform hover:scale-105 shadow-md cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 text-cream-white" />
              Cart
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[11px] font-bold text-white">
                {totalCartItems}
              </span>
            </button>
          )}

          {/* Admin Logout button */}
          {isAdminRoute && currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-xs font-bold text-chocolate border border-border hover:bg-blush transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="h-3.5 w-3.5 text-rose" />
              Logout
            </button>
          )}

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card lg:hidden"
          >
            <Menu className="h-5 w-5 text-chocolate" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-blush px-6 py-6 lg:hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl font-black text-chocolate">
                {isAdminRoute ? "Admin CMS Panel" : "Shreya's Home Bakery"}
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-white text-chocolate"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-3">
              {isAdminRoute
                ? adminLinks.map((l, i) => (
                    <motion.div
                      key={l.name}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="font-display text-3xl font-black text-chocolate hover:text-rose transition-colors"
                      >
                        {l.name}
                      </Link>
                    </motion.div>
                  ))
                : links.map((l, i) => {
                    if (l.href === "/orders") {
                      return (
                        <motion.div
                          key={l.name}
                          initial={{ opacity: 0, x: -18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 * i }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              handleMyOrdersClick();
                            }}
                            className="font-display text-4xl font-black text-chocolate hover:text-rose transition-colors text-left cursor-pointer"
                          >
                            {l.name}
                          </button>
                        </motion.div>
                      );
                    }
                    return (
                      <motion.div
                        key={l.name}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 * i }}
                      >
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="font-display text-4xl font-black text-chocolate hover:text-rose transition-colors"
                        >
                          {l.name}
                        </Link>
                      </motion.div>
                    );
                  })}
            </nav>
            <div className="mt-auto pt-6 flex gap-3">
              {isAdminRoute ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="block w-full text-center rounded-full bg-chocolate py-4 font-semibold text-cream-white flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out Admin
                </button>
              ) : (
                <Link
                  href="/catalog"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center rounded-full bg-chocolate py-4 font-semibold text-cream-white"
                >
                  Order Now
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
