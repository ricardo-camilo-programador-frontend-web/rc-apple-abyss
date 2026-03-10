'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { GameState, Language } from '@/lib/game/types';
import { WORM_UPGRADES } from '@/lib/game/constants';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import AdsterraAd from '@/components/AdsterraAd';
import AdSenseAd from '@/components/AdSenseAd';
import { AdFormat } from '@/lib/ads/adsterra';
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
  Info,
  BookOpen,
  Zap,
  MousePointer2,
  Sword,
  Users,
  History
} from 'lucide-react';

export default function Game() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(() => engine.getState());
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [offlineResult, setOfflineResult] = useState<{ apples: number, gold: number } | null>(() => (state as any).lastOfflineResult || null);
  const [clickEffects, setClickEffects] = useState<{ id: number, x: number, y: number, value: number }[]>([]);
  const clickIdCounter = useRef(0);
  const lastClickUpgradeTime = useRef(0);
  const [particleOffsets] = useState(() => 
    Array.from({ length: 10 }).map(() => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      delay: Math.random() * 1.5
    }))
  );

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

  if (!isMounted || !state || !engine) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const t = (key: string, params?: any) => engine.getLocalization().t(key, params);

  const handleClick = (e: React.MouseEvent) => {
    engine.clickApple();
    const damage = engine.getClickDamage();
    
    // Add click effect
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

  // Calculate apple visual state
  const hpPercent = (state.appleHP / state.maxAppleHP) * 100;
  const biteCount = Math.floor((100 - hpPercent) / 20); // 5 stages of bites

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 overflow-hidden select-none">
      {/* Adsterra Global Formats */}
      <AdsterraAd format={AdFormat.POPUNDER} />
      <AdsterraAd format={AdFormat.SOCIAL_BAR} />

      {/* Top Bar */}
      <header className="bg-white border-b border-stone-200 p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500 w-5 h-5" />
            <span className="font-mono font-bold text-lg">{Math.floor(state.gold).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-orange-500 w-5 h-5" />
            <span className="font-bold">{t('stage')}: {state.stage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-500 w-5 h-5" />
            <span className="font-bold">{t('souls')}: {state.gardenersSouls}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Left Panel: Upgrades */}
        <aside className="w-full md:w-72 bg-white border-r border-stone-200 overflow-y-auto p-4 flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">{t('upgrades')}</h2>
          
          {/* Click Power Upgrade */}
          <motion.button
            key={`click-power-${state.clickLevel}`}
            onClick={handleBuyClickUpgrade}
            disabled={state.gold < engine.getClickUpgradeCost()}
            initial={false}
            animate={{ scale: [1, 1.02, 1] }}
            className={`group relative flex flex-col p-3 rounded-xl border-2 transition-all text-left mb-2 ${
              state.gold >= engine.getClickUpgradeCost()
                ? 'border-yellow-200 hover:border-yellow-400 bg-yellow-50/30 active:scale-95' 
                : 'border-stone-100 bg-stone-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-sm flex items-center gap-2">
                <MousePointer2 className="w-4 h-4 text-yellow-600" />
                {t('upgrade_click_power')}
              </span>
              <span className="text-xs font-mono bg-white px-1.5 py-0.5 rounded border border-yellow-100">Lv.{state.clickLevel}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-yellow-600 font-mono text-sm font-bold">
                <Coins className="w-3 h-3" />
                {Math.floor(engine.getClickUpgradeCost()).toLocaleString()}
              </div>
              <div className="flex flex-col items-end">
                <div className="text-[10px] text-stone-500">Dmg: {engine.getClickDamage().toFixed(1)}</div>
                <div className="text-[8px] text-stone-400">Next: {(engine.getClickDamage() * 1.12).toFixed(1)}</div>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 text-[8px] text-stone-300 font-bold uppercase">[C]</div>
          </motion.button>

          <div className="h-px bg-stone-100 my-1" />

          {WORM_UPGRADES.map(upgrade => {
            const cost = engine.getUpgradeCost(upgrade.id);
            const canAfford = state.gold >= cost;
            const count = state.worms[upgrade.id] || 0;
            const currentDPS = engine.getWormDPS(upgrade.id);
            const nextDPS = count === 0 ? upgrade.baseDPS : currentDPS * upgrade.dpsGrowth;

            return (
              <motion.button
                key={`${upgrade.id}-${count}`}
                onClick={() => handleBuyUpgrade(upgrade.id)}
                disabled={!canAfford}
                initial={false}
                animate={{ scale: [1, 1.02, 1] }}
                className={`group relative flex flex-col p-3 rounded-xl border-2 transition-all text-left ${
                  canAfford 
                    ? 'border-stone-200 hover:border-red-400 bg-white active:scale-95' 
                    : 'border-stone-100 bg-stone-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm">{t(upgrade.nameKey)}</span>
                  <span className="text-xs font-mono bg-stone-100 px-1.5 py-0.5 rounded">Lv.{count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-yellow-600 font-mono text-sm font-bold">
                    <Coins className="w-3 h-3" />
                    {Math.floor(cost).toLocaleString()}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] text-stone-500">DPS: {currentDPS.toFixed(1)}</div>
                    <div className="text-[8px] text-stone-400">Next: {nextDPS.toFixed(1)}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </aside>

        {/* Center: Game Plate */}
        <section className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Ad Slot Top */}
          <div className="absolute top-4 w-full max-w-md h-20 bg-stone-200/50 rounded flex items-center justify-center text-[10px] text-stone-400 uppercase tracking-widest overflow-hidden">
            <AdSenseAd slot="horizontal-top" className="w-full h-full" />
          </div>

          {/* Apple & Plate */}
          <div className="relative group cursor-pointer" onClick={handleClick}>
            {/* Plate */}
            <div className={`w-64 h-64 md:w-80 md:h-80 bg-white rounded-full shadow-inner border-8 border-stone-200 flex items-center justify-center apple-shadow transition-all duration-300 ${state.skills.golden_harvest.isActive ? 'skill-glow scale-105 border-yellow-400' : ''}`}>
              {/* Apple Sprite (CSS based for performance/simplicity) */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.02, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-40 h-40 md:w-48 md:h-48"
              >
                {/* Apple Body */}
                <div className={`absolute inset-0 rounded-[40%] shadow-lg transition-colors duration-300 ${state.skills.golden_harvest.isActive ? 'bg-yellow-500' : 'bg-red-500'}`}>
                  {/* Stem */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-6 bg-amber-800 rounded-full" />
                  {/* Leaf */}
                  <div className="absolute -top-6 left-1/2 w-8 h-4 bg-green-500 rounded-full origin-left rotate-[-30deg]" />
                  
                  {/* Bite Marks */}
                  {Array.from({ length: biteCount }).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute bg-stone-100 rounded-full"
                      style={{
                        width: '30%',
                        height: '30%',
                        top: `${20 + (i * 15)}%`,
                        right: i % 2 === 0 ? '-10%' : 'auto',
                        left: i % 2 !== 0 ? '-10%' : 'auto',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Skill Particles */}
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

            {/* Worms Visuals */}
            {Object.entries(state.worms).map(([id, count]) => {
              if (count === 0) return null;
              return Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                <motion.div
                  key={`${id}-${i}`}
                  animate={{
                    x: [0, 10, -10, 0],
                    y: [0, -10, 10, 0],
                    rotate: [0, 45, -45, 0]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-6 h-2 bg-green-400 rounded-full border border-green-600 z-20"
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                  }}
                />
              ));
            })}
          </div>

          {/* HP Bar */}
          <div className="mt-12 w-full max-w-xs flex flex-col gap-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tighter text-stone-500">
                <span>HP</span>
                <span>{Math.ceil(state.appleHP).toLocaleString()} / {state.maxAppleHP.toLocaleString()}</span>
              </div>
              <div className="h-4 bg-stone-200 rounded-full overflow-hidden shadow-inner border border-stone-300">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-400"
                  initial={false}
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                />
              </div>
            </div>

            {/* Skill Button */}
            <div className="flex justify-center">
              <button
                onClick={handleActivateSkill}
                disabled={state.skills.golden_harvest.cooldownRemaining > 0 || state.skills.golden_harvest.isActive}
                className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all overflow-hidden ${
                  state.skills.golden_harvest.isActive
                    ? 'bg-yellow-500 text-white skill-glow'
                    : state.skills.golden_harvest.cooldownRemaining > 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-white border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 active:scale-95 shadow-lg shadow-yellow-100'
                }`}
              >
                <Zap className={`w-5 h-5 ${state.skills.golden_harvest.isActive ? 'animate-bounce' : ''}`} />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm">{t('skill_golden_harvest')}</span>
                  <span className="text-[10px] opacity-70">
                    {state.skills.golden_harvest.isActive 
                      ? `${t('skill_active')}: ${Math.ceil(state.skills.golden_harvest.remainingDuration)}s`
                      : state.skills.golden_harvest.cooldownRemaining > 0
                      ? `${t('skill_cooldown')}: ${Math.ceil(state.skills.golden_harvest.cooldownRemaining)}s`
                      : 'Ready!'}
                  </span>
                </div>
                
                {/* Cooldown Overlay */}
                {state.skills.golden_harvest.cooldownRemaining > 0 && !state.skills.golden_harvest.isActive && (
                  <motion.div 
                    className="absolute inset-0 bg-black/5"
                    initial={false}
                    animate={{ height: `${(state.skills.golden_harvest.cooldownRemaining / 120) * 100}%` }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Ad Slot Bottom */}
          <div className="absolute bottom-4 w-full max-w-md h-20 bg-stone-200/50 rounded flex items-center justify-center text-[10px] text-stone-400 uppercase tracking-widest overflow-hidden">
            <AdSenseAd slot="horizontal-bottom" className="w-full h-full" />
          </div>
        </section>

        {/* Right Panel: Ascension & Stats */}
        <aside className="w-full md:w-72 bg-white border-l border-stone-200 p-4 flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">{t('ascension')}</h2>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-purple-700 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>{t('pending_souls')}: {engine.getPendingSouls()}</span>
              </div>
              <p className="text-[10px] text-purple-600 leading-relaxed">
                {t('ascension_desc') || 'Ascending resets your progress but grants Gardeners Souls. Each soul increases your damage and gold earnings.'}
              </p>
              <button
                onClick={handleAscend}
                disabled={!engine.canAscend()}
                className={`w-full py-2 rounded-xl font-bold text-sm transition-all ${
                  engine.canAscend()
                    ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-lg shadow-purple-200'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {t('ascend')}
              </button>
              {!engine.canAscend() && (
                <div className="text-[10px] text-center text-stone-400">
                  {t('ascend_requirement') || 'Reach stage 50 to ascend'}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">{t('stats')}</h2>
            <div className="grid grid-cols-1 gap-3">
              {/* Gold Card */}
              <div className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-xl group-hover:scale-110 transition-transform">
                    <Coins className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('gold')}</span>
                    <span className="font-mono font-bold text-sm">{Math.floor(state.gold).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Stage Card */}
              <div className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl group-hover:scale-110 transition-transform">
                    <Trophy className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('stage')}</span>
                    <span className="font-mono font-bold text-sm">{state.stage}</span>
                  </div>
                </div>
              </div>

              {/* Click Damage Card */}
              <div className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-xl group-hover:scale-110 transition-transform">
                    <MousePointer2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('stats_click_damage')}</span>
                    <span className="font-mono font-bold text-sm">{engine.getClickDamage().toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Idle DPS Card */}
              <div className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                    <Sword className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('stats_idle_dps')}</span>
                    <span className="font-mono font-bold text-sm">{engine.getTotalDPS().toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Worm Power Card */}
              <div className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Worm Power</span>
                    <span className="font-mono font-bold text-sm">
                      {Object.values(state.worms).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gardeners Souls Card */}
              <div className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('souls')}</span>
                    <span className="font-mono font-bold text-sm">{state.gardenersSouls}</span>
                  </div>
                </div>
              </div>

              {/* History Card */}
              <div className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-50 rounded-xl group-hover:scale-110 transition-transform">
                    <History className="w-4 h-4 text-stone-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('total_eaten')}</span>
                    <span className="font-mono font-bold text-sm">{state.totalApplesEaten.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Bar */}
      <footer className="bg-white border-t border-stone-200 p-3 flex justify-between items-center text-[10px] text-stone-400 z-10">
        <div className="flex items-center gap-4">
          <span>© 2026 Apple of the Infinite Abyss</span>
          <a 
            href="https://github.com/ricardo-camilo-programador-frontend-web" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-stone-600 transition-colors"
          >
            <Github className="w-3 h-3" />
            ricardo-camilo
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/apple-varieties" 
            className="flex items-center gap-1 hover:text-stone-600 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>{t('apple_guide_footer_link')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3" />
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
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
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('settings')}
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-stone-400 hover:text-stone-600">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Sound */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2">
                    <Volume2 className="w-3 h-3" />
                    {t('settings_sound')}
                  </label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleMute}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        state.settings.muted ? 'border-red-200 bg-red-50 text-red-600' : 'border-stone-200 text-stone-600'
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

                {/* Language */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2">
                    <Languages className="w-3 h-3" />
                    {t('settings_language')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {(['en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja', 'sw', 'mr', 'te', 'tr', 'ta', 'vi', 'ko'] as Language[]).map(lang => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                          state.settings.language === lang 
                            ? 'bg-red-500 text-white border-red-600 shadow-md' 
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Progress Modal */}
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
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Coins className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold">{t('offline_welcome')}</h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                {t('offline_earnings', { n: offlineResult.apples, g: Math.floor(offlineResult.gold).toLocaleString() })}
              </p>
              <button 
                onClick={() => setOfflineResult(null)}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
              >
                {t('awesome') || 'Awesome!'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click Effects */}
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
    </div>
  );
}
