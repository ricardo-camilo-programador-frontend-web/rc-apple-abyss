'use client';

import type React from 'react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

const TONE: Record<string, string> = {
  yellow: 'gold',
  orange: 'stage',
  red: 'apple',
  blue: 'info',
  green: 'teal',
  purple: 'magic',
  stone: 'info',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  color = 'stone',
  onClick,
}: StatCardProps) {
  const tone = TONE[color] ?? 'info';
  const body = (
    <div className="flex items-center gap-2.5">
      <div className="abyss-card-icon w-9 h-9">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0 abyss-stat-text">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 truncate">
          {label}
        </div>
        <div className="abyss-stat-value">{value}</div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="abyss-stat w-full text-left"
        data-tone={tone}
        onClick={onClick}
      >
        {body}
      </button>
    );
  }

  return (
    <div className="abyss-stat w-full" data-tone={tone}>
      {body}
    </div>
  );
}
