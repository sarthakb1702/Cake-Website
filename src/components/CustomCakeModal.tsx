"use client";

import React from "react";
import { CustomCakeOrderForm } from "./CustomCakeOrderForm";

export function CustomCakeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <CustomCakeOrderForm isModal onClose={onClose} />
      </div>
    </div>
  );
}
