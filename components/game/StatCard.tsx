'use client';

import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
  onClick?: () => void;
}

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'stone',
  onClick 
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    yellow: 'from-yellow-50 to-amber-50 text-yellow-600',
    orange: 'from-orange-50 to-amber-50 text-orange-600',
    red: 'from-red-50 to-rose-50 text-red-600',
    blue: 'from-blue-50 to-indigo-50 text-blue-600',
    green: 'from-green-50 to-emerald-50 text-green-600',
    purple: 'from-purple-50 to-violet-50 text-purple-600',
    stone: 'from-stone-50 to-slate-50 text-stone-600',
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -1 }}
      className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl cursor-default ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-wider opacity-70 truncate">{label}</div>
          <div className="font-mono font-bold text-sm truncate">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}
