import React from 'react';
import { Bug, Target, Users, Crown, Flame, Zap, Rocket, Sparkles, Atom, InfinityIcon } from 'lucide-react';

export const WORM_CATEGORIES: Record<string, {
  title: string;
  icon: React.ElementType;
  color: string;
  ids: string[];
}> = {
  basic: {
    title: 'Basic Worms',
    icon: Bug,
    color: 'emerald',
    ids: ['small_worm', 'hungry_worm', 'fat_worm']
  },
  advanced: {
    title: 'Advanced Worms',
    icon: Flame,
    color: 'orange',
    ids: ['queen_worm', 'acid_worm', 'mutant_worm']
  },
  special: {
    title: 'Special Worms',
    icon: Crown,
    color: 'violet',
    ids: ['mecha_worm', 'galactic_worm', 'quantum_worm']
  },
  legendary: {
    title: 'Legendary Worms',
    icon: InfinityIcon,
    color: 'rose',
    ids: ['dimensional_worm', 'infinite_worm']
  }
};

export const WORM_ICONS: Record<string, React.ElementType> = {
  small_worm: Bug,
  hungry_worm: Target,
  fat_worm: Users,
  queen_worm: Crown,
  acid_worm: Flame,
  mutant_worm: Zap,
  mecha_worm: Rocket,
  galactic_worm: Sparkles,
  quantum_worm: Atom,
  dimensional_worm: InfinityIcon,
  infinite_worm: InfinityIcon,
};
