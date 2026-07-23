'use client';

import { motion } from 'motion/react';
import type React from 'react';

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
  onClick,
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    yellow:
      'from-yellow-50 to-amber-50 text-yellow-600 dark:from-yellow-900/40 dark:to-amber-900/40 dark:text-yellow-400',
    orange:
      'from-orange-50 to-amber-50 text-orange-600 dark:from-orange-900/40 dark:to-amber-900/40 dark:text-orange-400',
    red: 'from-red-50 to-rose-50 text-red-600 dark:from-red-900/40 dark:to-rose-900/40 dark:text-red-400',
    blue: 'from-blue-50 to-indigo-50 text-blue-600 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-400',
    green:
      'from-green-50 to-emerald-50 text-green-600 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-400',
    purple:
      'from-purple-50 to-violet-50 text-purple-600 dark:from-purple-900/40 dark:to-violet-900/40 dark:text-purple-400',
    stone:
      'from-stone-50 to-slate-50 text-stone-600 dark:from-stone-800/60 dark:to-slate-800/60 dark:text-stone-300',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl cursor-default ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/60 dark:bg-stone-700/80 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-wider opacity-70 dark:text-stone-400 truncate">
            {label}
          </div>
          <div className="font-mono font-bold text-sm dark:text-stone-100 truncate">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}
