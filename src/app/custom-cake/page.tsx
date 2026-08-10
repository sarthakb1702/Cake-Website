"use client";

import React from "react";
import { CustomCakeOrderForm } from "@/components/CustomCakeOrderForm";

export default function CustomCakePage() {
  return (
    <div className="min-h-screen bg-cream py-10 px-5 md:px-10">
      <div className="mx-auto max-w-4xl">
        <CustomCakeOrderForm />
      </div>
    </div>
  );
}
