"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useCart } from "../context/CartContext";

export function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch user document from Firestore using the auth UID
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data()?.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const totalCartItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Brand Logo */}
      <Link href="/" className="text-xl font-bold text-orange-600 flex items-center gap-2">
        <span>🎂</span> SweetStudio
      </Link>

      {/* Navigation Links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
        <Link href="/cakes" className="hover:text-gray-900 transition-colors">
          Cakes
        </Link>
        <Link href="/donuts" className="hover:text-gray-900 transition-colors">
          Donuts
        </Link>
        <Link href="/fudge" className="hover:text-gray-900 transition-colors">
          Fudge
        </Link>

        {/* Conditional Admin Button */}
        {isAdmin && (
          <Link
            href="/admin"
            className="px-3 py-1.5 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 transition-colors text-xs flex items-center gap-1.5"
          >
            <span>🛠️</span> Admin Dashboard
          </Link>
        )}
      </nav>

      {/* Auth & Cart Actions */}
      <div className="flex items-center gap-4">
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium hidden md:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </>
        )}

        {/* Cart Icon */}
        <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <span className="text-lg">🛒</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCartItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}