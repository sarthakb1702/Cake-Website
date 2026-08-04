import React from 'react';
import { Clock } from 'lucide-react';

export const PreparationNotice = () => {
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-xs md:text-sm font-medium">
      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
      <span>Freshly baked! Available for pickup/delivery <strong>2 to 3 hours</strong> after placing order.</span>
    </div>
  );
};