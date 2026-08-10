"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

export type UserRole = "user" | "admin";

export interface UserProfile {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  userProfile: UserProfile;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const defaultProfile: UserProfile = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ensureUserProfile = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      await setDoc(
        userRef,
        {
          email: user.email,
          role: "user" as UserRole,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("Firestore user profile check fallback to local storage:", err);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  // Hydrate local profile
  useEffect(() => {
    try {
      const stored = localStorage.getItem("crumb_co_user_profile");
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user profile from local storage:", e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setUserRole("user");
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      await ensureUserProfile(user);

      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const role = (data?.role as UserRole | undefined) || "user";
          setUserRole(role);

          if (data?.profile) {
            setUserProfile((prev) => {
              const updated = { ...prev, ...data.profile };
              localStorage.setItem("crumb_co_user_profile", JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch user role from firestore, fallback to default user role:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(result.user);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (profileUpdate: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profileUpdate };
    setUserProfile(updated);
    localStorage.setItem("crumb_co_user_profile", JSON.stringify(updated));

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, { profile: updated }, { merge: true });
      } catch (err) {
        console.warn("Could not sync profile update to firestore:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};
