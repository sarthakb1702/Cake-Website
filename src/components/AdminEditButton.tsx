"use client";

import React from "react";
import Link from "next/link";
import { Edit3 } from "lucide-react";

interface AdminEditButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function AdminEditButton({
  href,
  onClick,
  label = "Edit",
  className = "",
}: AdminEditButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E86A7A] px-4 py-2 text-xs font-bold text-white shadow-badge transition-all hover:bg-[#d65767] hover:scale-105 cursor-pointer z-30";

  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${className}`}>
        <Edit3 className="h-3.5 w-3.5 text-white" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseStyles} ${className}`}>
      <Edit3 className="h-3.5 w-3.5 text-white" />
      <span>{label}</span>
    </button>
  );
}
