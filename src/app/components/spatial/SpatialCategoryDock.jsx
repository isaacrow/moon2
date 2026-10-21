import React from 'react';
import { Compass, BookOpen, Landmark, Shield, Sparkles, Box } from 'lucide-react';
import { CATEGORIES } from './data/records';

const ICON_MAP = {
  Compass,
  BookOpen,
  Landmark,
  Shield,
  Sparkles,
  Box
};

export default function SpatialCategoryDock({ selectedCategory, onSelectCategory, lang, counts = {} }) {
  const isAr = lang === 'ar';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-6">
      <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Compass;
          const isActive = selectedCategory === cat.id;
          const count = counts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`glass-pill px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive ? 'active' : 'text-slate-200 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 text-white" />
              <span>{cat.label[lang]}</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                isActive ? 'bg-white text-black font-bold' : 'bg-white/10 text-slate-200'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
