'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { GameState, Language } from '@/lib/game/types';
import { WORM_UPGRADES } from '@/lib/game/constants';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import AdsterraAd from '@/components/AdsterraAd';
import AdSenseAd from '@/components/AdSenseAd';
import Modal from '@/components/Modal';
import { AdFormat } from '@/lib/ads/adsterra';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Coins, 
  Trophy, 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  Languages,
  Github,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Zap,
  MousePointer2,
  Sword,
  Users,
  History,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  BarChart2,
  Target,
  Bug,
  Crown,
  Atom,
  Rocket,
  InfinityIcon,
  Flame,
  Heart,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const APPLE_SPRITES = [
  '/assets/apples/red-delicious-apple-1.webp',
  '/assets/apples/red-delicious-apple-2.webp',
  '/assets/apples/red-delicious-apple-3.webp',
  '/assets/apples/red-delicious-apple-4.webp',
] as const;

const getAppleSpriteIndex = (currentHp: number, maxHp: number): number => {
  const percent = (currentHp / maxHp) * 100;
  if (percent > 75) return 0;
  if (percent > 50) return 1;
  if (percent > 25) return 2;
  return 3;
};

const WORM_CATEGORIES: Record<string, {
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

const WORM_ICONS: Record<string, React.ElementType> = {
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

function UpgradeCard({ 
  upgrade, 
  count, 
  cost, 
  canAfford, 
  currentDPS, 
  nextDPS,
  onBuy 
}: {
  upgrade: typeof WORM_UPGRADES[0];
  count: number;
  cost: number;
  canAfford: boolean;
  currentDPS: number;
  nextDPS: number;
  onBuy: () => void;
}) {
  const Icon = WORM_ICONS[upgrade.id] || Bug;
  
  return (
    <motion.button
      onClick={onBuy}
      disabled={!canAfford}
      whileHover={canAfford ? { scale: 1.01, y: -2 } : {}}
      whileTap={canAfford ? { scale: 0.98 } : {}}
      className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
        canAfford 
          ? 'bg-white dark:bg-stone-800 hover:shadow-lg border border-stone-100 dark:border-stone-600 hover:border-stone-200 cursor-pointer' 
          : 'bg-stone-50/50 dark:bg-stone-800/50 border border-stone-100/50 dark:border-stone-600/50 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          canAfford ? 'bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-700 dark:to-stone-600' : 'bg-stone-100 dark:bg-stone-700'
        }`}>
          <Icon className={`w-5 h-5 ${canAfford ? 'text-stone-600 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{upgrade.nameKey.replace('upgrade_', '').replace(/_/g, ' ')}</span>
            <span className="text-xs font-mono bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded-md shrink-0">
              Lv.{count}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-yellow-600 font-mono text-xs">
              <Coins className="w-3 h-3" />
              <span>{Math.floor(cost).toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400">
              DPS: {currentDPS.toFixed(1)} → {nextDPS.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'stone',
  onClick 
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
  onClick?: () => void;
}) {
  const colorClasses: Record<string, string> = {
    yellow: 'from-yellow-50 to-amber-50 text-yellow-600 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-400',
    orange: 'from-orange-50 to-amber-50 text-orange-600 dark:from-orange-900/30 dark:to-amber-900/30 dark:text-orange-400',
    red: 'from-red-50 to-rose-50 text-red-600 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400',
    blue: 'from-blue-50 to-indigo-50 text-blue-600 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400',
    green: 'from-green-50 to-emerald-50 text-green-600 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400',
    purple: 'from-purple-50 to-violet-50 text-purple-600 dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-400',
    stone: 'from-stone-50 to-slate-50 text-stone-600 dark:from-stone-700/50 dark:to-slate-700/50 dark:text-stone-300',
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -1 }}
      className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl cursor-default ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/60 dark:bg-stone-700/60 rounded-lg flex items-center justify-center">
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

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  color, 
  children, 
  defaultOpen = true 
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg ${colors.bg} ${colors.border} border transition-all hover:shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.text}`} />
          <span className={`font-semibold text-sm ${colors.text}`}>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className={`w-4 h-4 ${colors.text}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${colors.text}`} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Game() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(() => engine.getState());
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  const [showAscensionModal, setShowAscensionModal] = useState(false);
  const [showStatsPanelModal, setShowStatsPanelModal] = useState(false);
  const [showHelp, setShowHelp] = useState<{ title: string, content: string } | null>(null);
  const [offlineResult, setOfflineResult] = useState<{ apples: number, gold: number } | null>(() => (state as any).lastOfflineResult || null);
  const [clickEffects, setClickEffects] = useState<{ id: number, x: number, y: number, value: number }[]>([]);
  const [importString, setImportString] = useState('');
  const [importError, setImportError] = useState('');
  const clickIdCounter = useRef(0);
  const lastClickUpgradeTime = useRef(0);
  const [isShaking, setIsShaking] = useState(false);
  const [particleOffsets] = useState(() => 
    Array.from({ length: 10 }).map(() => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      delay: Math.random() * 1.5
    }))
  );
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    let frameId: number;
    const loop = () => {
      engine.tick();
      setState({ ...engine.getState() });
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [engine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        const now = Date.now();
        if (now - lastClickUpgradeTime.current < 150) return;
        lastClickUpgradeTime.current = now;
        
        if (engine.buyClickUpgrade()) {
          setState({ ...engine.getState() });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted || !state || !engine) return <div className="flex items-center justify-center h-screen bg-stone-50 dark:bg-stone-900">Loading...</div>;

  const t = (key: string, params?: any) => engine.getLocalization().t(key, params);

  const handleClick = (e: React.MouseEvent) => {
    engine.clickApple();
    const damage = engine.getClickDamage();
    
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 150);
    
    const newEffect = {
      id: clickIdCounter.current++,
      x: e.clientX,
      y: e.clientY,
      value: Math.floor(damage)
    };
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(eff => eff.id !== newEffect.id));
    }, 1000);
  };

  const handleBuyUpgrade = (id: string) => {
    engine.buyUpgrade(id);
  };

  const handleBuyClickUpgrade = () => {
    engine.buyClickUpgrade();
    setState({ ...engine.getState() });
  };

  const handleAscend = () => {
    if (confirm(t('ascend_confirm') || 'Are you sure you want to ascend? You will lose all current progress but gain permanent bonuses.')) {
      engine.ascend();
    }
  };

  const toggleMute = () => {
    const newMuted = !state.settings.muted;
    engine.setMuted(newMuted);
    setState({ ...engine.getState() });
  };

  const changeLanguage = (lang: Language) => {
    engine.setLanguage(lang);
    setState({ ...engine.getState() });
  };

  const handleActivateSkill = () => {
    engine.activateSkill('golden_harvest');
    setState({ ...engine.getState() });
  };

  const handleExportSave = () => {
    const saveStr = engine.exportSave();
    navigator.clipboard.writeText(saveStr).then(() => {
      alert('Save copied to clipboard!');
    }).catch(() => {
      prompt('Copy your save string:', saveStr);
    });
  };

  const handleImportSave = () => {
    if (!importString.trim()) {
      setImportError('Please enter a save string.');
      return;
    }
    
    const success = engine.importSave(importString.trim());
    if (success) {
      setState({ ...engine.getState() });
      setImportString('');
      setImportError('');
      alert('Save imported successfully!');
      setShowSettings(false);
    } else {
      setImportError('Invalid save string or corrupted data.');
    }
  };

  const handleResetGame = () => {
    if (confirm('Are you sure you want to completely reset your game? This cannot be undone!')) {
      engine.resetGame();
      setState({ ...engine.getState() });
      setShowSettings(false);
    }
  };

  const renderUpgradesContent = () => {
    const upgradesByCategory = Object.entries(WORM_CATEGORIES).map(([key, category]) => ({
      ...category,
      upgrades: category.ids.map(id => WORM_UPGRADES.find(u => u.id === id)).filter(Boolean)
    }));

    return (
      <>
        <CollapsibleSection 
          title="Click Power" 
          icon={MousePointer2} 
          color="yellow"
        >
          <motion.button
            onClick={handleBuyClickUpgrade}
            disabled={state.gold < engine.getClickUpgradeCost()}
            whileHover={state.gold >= engine.getClickUpgradeCost() ? { scale: 1.01, y: -2 } : {}}
            whileTap={state.gold >= engine.getClickUpgradeCost() ? { scale: 0.98 } : {}}
            className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
              state.gold >= engine.getClickUpgradeCost()
                ? 'bg-white dark:bg-stone-800 hover:shadow-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer' 
                : 'bg-stone-50/50 dark:bg-stone-800/50 border border-stone-100/50 dark:border-stone-700/50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40 rounded-lg flex items-center justify-center">
                <MousePointer2 className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">Click Power</span>
                  <span className="text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-md shrink-0">
                    Lv.{state.clickLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-yellow-600 font-mono text-xs">
                    <Coins className="w-3 h-3" />
                    <span>{Math.floor(engine.getClickUpgradeCost()).toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Dmg: {engine.getClickDamage().toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 text-[8px] text-stone-300 font-bold uppercase">[C]</div>
          </motion.button>
        </CollapsibleSection>

        {upgradesByCategory.map(category => (
          <CollapsibleSection 
            key={category.title}
            title={category.title} 
            icon={category.icon} 
            color={category.color}
            defaultOpen={category.title === 'Basic Worms'}
          >
            {category.upgrades.map(upgrade => {
              if (!upgrade) return null;
              const cost = engine.getUpgradeCost(upgrade.id);
              const canAfford = state.gold >= cost;
              const count = state.worms[upgrade.id] || 0;
              const currentDPS = engine.getWormDPS(upgrade.id);
              const nextDPS = count === 0 ? upgrade.baseDPS : currentDPS * upgrade.dpsGrowth;

              return (
                <UpgradeCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  count={count}
                  cost={cost}
                  canAfford={canAfford}
                  currentDPS={currentDPS}
                  nextDPS={nextDPS}
                  onBuy={() => handleBuyUpgrade(upgrade.id)}
                />
              );
            })}
          </CollapsibleSection>
        ))}
      </>
    );
  };

  const renderAscensionContent = () => {
    const progress = Math.min((state.stage / 50) * 100, 100);
    const canAscend = engine.canAscend();
    const pendingWorms = engine.getPendingLuckyWorms();

    return (
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-2xl p-4 border border-violet-100 dark:border-violet-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/40 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <div className="font-semibold text-sm text-violet-900 dark:text-violet-200">Ascension</div>
            <div className="text-[10px] text-violet-600">Reset for permanent bonuses</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-violet-600">Progress to Stage 50</span>
            <span className="font-mono text-violet-900 dark:text-violet-200">{state.stage}/50</span>
          </div>
          <div className="h-2 bg-violet-100 dark:bg-violet-900/40 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />
          </div>
        </div>

        {canAscend && (
          <div className="flex items-center gap-2 p-2 bg-violet-100/50 dark:bg-violet-900/30 rounded-lg mb-3">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-900 dark:text-violet-200">
              {pendingWorms} Lucky Worms ready!
            </span>
          </div>
        )}

        <button
          onClick={handleAscend}
          disabled={!canAscend}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
            canAscend
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 active:scale-95 shadow-lg shadow-violet-200'
              : 'bg-violet-100 dark:bg-violet-900/30 text-violet-400 dark:text-violet-500 cursor-not-allowed'
          }`}
        >
          {canAscend ? 'Ascend Now!' : `Reach Stage 50`}
        </button>

        <div className="mt-2 text-[10px] text-violet-500 text-center">
          Lucky Worms: +5% gold each
        </div>
      </div>
    );
  };

  const renderStatsPanelContent = () => (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Economy</div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard 
            icon={Coins} 
            label="Gold" 
            value={Math.floor(state.gold).toLocaleString()} 
            color="yellow" 
          />
          <StatCard 
            icon={Trophy} 
            label="Stage" 
            value={state.stage} 
            color="orange" 
          />
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Combat</div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard 
            icon={MousePointer2} 
            label="Click Dmg" 
            value={engine.getClickDamage().toFixed(1)} 
            color="red" 
          />
          <StatCard 
            icon={Sword} 
            label="Idle DPS" 
            value={engine.getTotalDPS().toFixed(1)} 
            color="blue" 
          />
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Progression</div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard 
            icon={Users} 
            label="Worms" 
            value={Object.values(state.worms).reduce((a, b) => a + b, 0)} 
            color="green" 
          />
          <StatCard 
            icon={Sparkles} 
            label="Lucky" 
            value={`${state.luckyWorms} (+${state.luckyWorms * 5}%)`} 
            color="purple" 
          />
          <StatCard 
            icon={History} 
            label="Eaten" 
            value={state.totalApplesEaten.toLocaleString()} 
            color="stone" 
          />
        </div>
      </div>
    </div>
  );

  const hpPercent = (state.appleHP / state.maxAppleHP) * 100;
  const activeSpriteIndex = getAppleSpriteIndex(state.appleHP, state.maxAppleHP);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 overflow-hidden select-none">
      <AdsterraAd format={AdFormat.POPUNDER} />
      <AdsterraAd format={AdFormat.SOCIAL_BAR} />
      <AdsterraAd format={AdFormat.SMARTLINK} />

      <header className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-b border-stone-200/50 dark:border-stone-700/50 p-2 md:p-3 flex justify-between items-center z-10 flex-wrap gap-2 sticky top-0">
        <div className="flex items-center gap-3 md:gap-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-xl border border-yellow-100 dark:border-yellow-800">
            <Coins className="text-yellow-500 w-4 h-4 md:w-5 md:h-5" />
            <span className="font-mono font-bold text-base md:text-lg text-yellow-700 dark:text-yellow-300">{Math.floor(state.gold).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-100 dark:border-orange-800">
            <Trophy className="text-orange-500 w-4 h-4 md:w-5 md:h-5" />
            <span className="font-bold text-sm md:text-base text-orange-700 dark:text-orange-300">{t('stage')}: {state.stage}</span>
          </div>
          <button 
            onClick={() => setShowHelp({ title: 'Lucky Worms', content: 'Lucky Worms increase your gold income! Formula: 1 + (Lucky Worms * 0.05)' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-100 dark:border-violet-800 hover:border-violet-200 dark:hover:border-violet-600 transition-colors"
          >
            <Sparkles className="text-violet-500 w-4 h-4 md:w-5 md:h-5" />
            <span className="font-bold text-sm md:text-base text-violet-700 dark:text-violet-300">
              {state.luckyWorms} <span className="hidden sm:inline opacity-70">(+{state.luckyWorms * 5}%)</span>
            </span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowStats(true)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors" title="Statistics">
            <History className="w-5 h-5 text-stone-500" />
          </button>
          <button onClick={() => setShowSkills(true)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors" title="Skills">
            <Zap className="w-5 h-5 text-stone-500" />
          </button>
          <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors" title="Toggle theme">
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-stone-500" />}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors" title="Settings">
            <Settings className="w-5 h-5 text-stone-500" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-r border-stone-200/50 dark:border-stone-700/50 gap-4 py-4">
          <AdSenseAd slot="vertical-left" format="auto" className="w-full flex-1" />
          <AdsterraAd format={AdFormat.DISPLAY_BANNER_160x300} className="w-full" />
        </div>

        <main className="flex-1 flex flex-col lg:flex-row relative overflow-y-auto">
          <aside className="hidden lg:flex w-80 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border-r border-stone-200/50 dark:border-stone-700/50 overflow-y-auto p-4 flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">{t('upgrades')}</h2>
              <span className="text-[10px] text-stone-400 font-mono">[C] quick buy</span>
            </div>
            {renderUpgradesContent()}
          </aside>

          <section className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative min-h-[500px]">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 via-orange-50/20 to-yellow-50/30 rounded-full blur-3xl scale-150" />
              
              <div className="relative group cursor-pointer" onClick={handleClick}>
                <div className={`relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto transition-all duration-500 ${
                  state.skills.golden_harvest.isActive ? 'scale-105' : ''
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-white via-stone-50 to-white rounded-full shadow-2xl transition-all duration-300 ${
                    state.skills.golden_harvest.isActive 
                      ? 'border-4 border-yellow-400 shadow-yellow-200/50' 
                      : 'border-4 border-stone-100'
                  }`} />
                  
                  <div className="absolute inset-4 bg-gradient-to-br from-stone-50 to-white rounded-full shadow-inner flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className={`relative w-full h-full flex items-center justify-center ${isShaking ? 'shake-active' : ''}`}
                    >
                      <div className={`apple-sprite-container absolute inset-8 transition-all duration-300 ${
                        state.skills.golden_harvest.isActive 
                          ? 'brightness-110 saturate-150 sepia-[0.3] hue-rotate-[40deg] drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]' 
                          : ''
                      }`}>
                        {APPLE_SPRITES.map((src, index) => (
                          <img
                            key={src}
                            src={src}
                            alt="Apple"
                            className="apple-sprite"
                            loading="eager"
                            decoding="async"
                            style={{ opacity: index === activeSpriteIndex ? 1 : 0 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {state.skills.golden_harvest.isActive && particleOffsets.map((offset, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0, 1.5, 0],
                        x: offset.x,
                        y: offset.y
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: offset.delay
                      }}
                      className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full z-30 shadow-lg"
                    />
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-stone-100 dark:border-stone-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Apple HP</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-stone-700 dark:text-stone-300">
                      {Math.ceil(state.appleHP).toLocaleString()} / {state.maxAppleHP.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-500 via-red-400 to-orange-400 rounded-full"
                      initial={false}
                      animate={{ width: `${hpPercent}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleActivateSkill}
                  disabled={state.skills.golden_harvest.cooldownRemaining > 0 || state.skills.golden_harvest.isActive}
                  whileHover={!state.skills.golden_harvest.cooldownRemaining && !state.skills.golden_harvest.isActive ? { scale: 1.02 } : {}}
                  whileTap={!state.skills.golden_harvest.cooldownRemaining && !state.skills.golden_harvest.isActive ? { scale: 0.98 } : {}}
                  className={`w-full relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all overflow-hidden ${
                    state.skills.golden_harvest.isActive
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-lg shadow-yellow-200/50'
                      : state.skills.golden_harvest.cooldownRemaining > 0
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-2 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:border-yellow-400 dark:hover:border-yellow-600 shadow-lg shadow-yellow-100/50'
                  }`}
                >
                  <Zap className={`w-5 h-5 ${state.skills.golden_harvest.isActive ? 'animate-bounce' : ''}`} />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{t('skill_golden_harvest')}</span>
                    <span className="text-[10px] opacity-70">
                      {state.skills.golden_harvest.isActive 
                        ? `${t('skill_active')}: ${Math.ceil(state.skills.golden_harvest.remainingDuration)}s`
                        : state.skills.golden_harvest.cooldownRemaining > 0
                        ? `${t('skill_cooldown')}: ${Math.ceil(state.skills.golden_harvest.cooldownRemaining)}s`
                        : 'x5 Click, x2.5 Idle'}
                    </span>
                  </div>
                  
                  {state.skills.golden_harvest.cooldownRemaining > 0 && !state.skills.golden_harvest.isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-stone-200/50"
                      initial={false}
                      animate={{ height: `${(state.skills.golden_harvest.cooldownRemaining / 120) * 100}%` }}
                    />
                  )}
                </motion.button>
              </div>
            </div>
          </section>

          <aside className="hidden lg:flex w-80 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border-l border-stone-200/50 dark:border-stone-700/50 p-4 flex-col gap-4 overflow-y-auto">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">{t('ascension')}</h2>
              {renderAscensionContent()}
            </div>

            <div className="flex-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">{t('stats')}</h2>
              {renderStatsPanelContent()}
            </div>
          </aside>
        </main>

        <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-l border-stone-200/50 dark:border-stone-700/50 gap-4 py-4">
          <AdSenseAd slot="vertical-right" format="auto" className="w-full flex-1" />
          <AdsterraAd format={AdFormat.DISPLAY_BANNER_160x300} className="w-full" />
        </div>
      </div>

      <nav className="lg:hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-t border-stone-200/50 dark:border-stone-700/50 flex justify-around p-3 z-10">
        <button onClick={() => setShowUpgradesModal(true)} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
          <TrendingUp className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          <span className="text-[10px] font-bold uppercase text-stone-500">{t('upgrades')}</span>
        </button>
        <button onClick={() => setShowAscensionModal(true)} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <span className="text-[10px] font-bold uppercase text-violet-600">{t('ascension')}</span>
        </button>
        <button onClick={() => setShowStatsPanelModal(true)} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
          <BarChart2 className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-bold uppercase text-blue-600">{t('stats')}</span>
        </button>
      </nav>

      <footer className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-t border-stone-200/50 dark:border-stone-700/50 p-3 md:p-4 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-stone-400 dark:text-stone-500 z-10 gap-3 md:gap-2">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <span className="font-medium">Apple of the Infinite Abyss</span>
          <a 
            href="https://github.com/ricardo-camilo-programador-frontend-web" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
          >
            <Github className="w-3 h-3 md:w-4 md:h-4" />
            GitHub
          </a>
          <a 
            href="https://ricardo-camilo-dev-frontend-web.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors hidden md:inline"
          >
            Portfolio
          </a>
          <Link href="/privacy" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Terms</Link>
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <Link 
            href="/apple-varieties" 
            className="flex items-center gap-1 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>{t('apple_guide_footer_link')}</span>
          </Link>
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      <div className="w-full h-[90px] bg-stone-200/30 dark:bg-stone-800/30 flex items-center justify-center border-t border-stone-200/50 dark:border-stone-700/50">
        <AdSenseAd slot="horizontal-footer" format="auto" className="w-full h-full max-w-4xl" />
      </div>

      <AdsterraAd format={AdFormat.NATIVE_BANNER} className="w-full max-w-4xl mx-auto my-4" />
      <AdsterraAd format={AdFormat.DISPLAY_BANNER_468x60} className="w-full max-w-4xl mx-auto my-2" />
      
      <Modal isOpen={!!showHelp} onClose={() => setShowHelp(null)} title={showHelp?.title || ''}>
        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{showHelp?.content}</p>
      </Modal>

      <Modal isOpen={showSkills} onClose={() => setShowSkills(false)} title={t('skills')}>
        <div className="space-y-4">
          <button 
            onClick={() => { engine.activateSkill('golden_harvest'); setShowSkills(false); }}
            className="w-full p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl flex items-center justify-between hover:border-yellow-300 dark:hover:border-yellow-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-yellow-900 dark:text-yellow-200">Golden Harvest</div>
                <div className="text-xs text-yellow-700 dark:text-yellow-400">x5 Click Gold, x2.5 Idle Gold for 20s</div>
              </div>
            </div>
            <div className="text-xs font-bold bg-yellow-200 dark:bg-yellow-900/50 px-2 py-1 rounded-full text-yellow-800 dark:text-yellow-300">Active</div>
          </button>
        </div>
      </Modal>

      <Modal isOpen={showStats} onClose={() => setShowStats(false)} title={t('statistics')}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Total Clicks:</span> <span className="font-mono font-bold">{state.totalClicks}</span></div>
          <div className="flex justify-between"><span>Apples Eaten:</span> <span className="font-mono font-bold">{state.totalApplesEaten}</span></div>
          <div className="flex justify-between"><span>Lucky Worms:</span> <span className="font-mono font-bold">{state.luckyWorms}</span></div>
          <div className="flex justify-between"><span>Gold Bonus:</span> <span className="font-mono font-bold">+{state.luckyWorms * 5}%</span></div>
        </div>
      </Modal>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-stone-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('settings')}
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-stone-400 dark:text-stone-500 flex items-center gap-2">
                    <Volume2 className="w-3 h-3" />
                    {t('settings_sound')}
                  </label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleMute}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        state.settings.muted ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 text-red-600' : 'border-stone-200 text-stone-600 dark:border-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {state.settings.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={state.settings.volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        engine.setVolume(v);
                        setState({ ...engine.getState() });
                      }}
                      className="flex-1 accent-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-stone-400 dark:text-stone-500 flex items-center gap-2">
                    <Languages className="w-3 h-3" />
                    {t('settings_language')}
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {(['en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja', 'sw', 'mr', 'te', 'tr', 'ta', 'vi', 'ko'] as Language[]).map(lang => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                          state.settings.language === lang 
                            ? 'bg-red-500 text-white border-red-600 shadow-md' 
                            : 'bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-700">
                  <label className="text-xs font-bold uppercase text-stone-400 dark:text-stone-500 flex items-center gap-2">
                    <Monitor className="w-3 h-3" />
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'light' as const, icon: Sun, label: 'Light' },
                      { value: 'dark' as const, icon: Moon, label: 'Dark' },
                      { value: 'system' as const, icon: Monitor, label: 'System' },
                    ]).map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                          theme === value
                            ? 'bg-red-500 text-white border-red-600 shadow-md'
                            : 'bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {offlineResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-stone-800 rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 rounded-full flex items-center justify-center mx-auto">
                <Coins className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold">{t('offline_welcome')}</h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                {t('offline_earnings', { n: offlineResult.apples, g: Math.floor(offlineResult.gold).toLocaleString() })}
              </p>
              <button 
                onClick={() => setOfflineResult(null)}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl font-bold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-200 active:scale-95"
              >
                {t('awesome') || 'Awesome!'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {clickEffects.map(effect => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 1, y: effect.y - 20, x: effect.x }}
            animate={{ opacity: 0, y: effect.y - 100 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-[100] font-mono font-bold text-red-500 text-xl drop-shadow-md"
          >
            +{effect.value}
          </motion.div>
        ))}
      </AnimatePresence>

      <Modal isOpen={showUpgradesModal} onClose={() => setShowUpgradesModal(false)} title={t('upgrades')}>
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {renderUpgradesContent()}
        </div>
      </Modal>

      <Modal isOpen={showAscensionModal} onClose={() => setShowAscensionModal(false)} title={t('ascension')}>
        {renderAscensionContent()}
      </Modal>

      <Modal isOpen={showStatsPanelModal} onClose={() => setShowStatsPanelModal(false)} title={t('stats')}>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {renderStatsPanelContent()}
        </div>
      </Modal>
    </div>
  );
}
