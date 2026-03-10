'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { GameState, Language } from '@/lib/game/types';
import { WORM_UPGRADES } from '@/lib/game/constants';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
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
  BookOpen
} from 'lucide-react';

export default function Game() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(() => engine.getState());
  const [showSettings, setShowSettings] = useState(false);
  const [offlineResult, setOfflineResult] = useState<{ apples: number, gold: number } | null>(() => (state as any).lastOfflineResult || null);
  const [clickEffects, setClickEffects] = useState<{ id: number, x: number, y: number, value: number }[]>([]);
  const clickIdCounter = useRef(0);

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

  if (!state || !engine) return <div className="flex items-center justify-center h-screen">Loading...</div>;

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

  // Calculate apple visual state
  const hpPercent = (state.appleHP / state.maxAppleHP) * 100;
  const biteCount = Math.floor((100 - hpPercent) / 20); // 5 stages of bites

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 overflow-hidden select-none">
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
          {WORM_UPGRADES.map(upgrade => {
            const cost = engine.getUpgradeCost(upgrade.id);
            const canAfford = state.gold >= cost;
            const count = state.worms[upgrade.id] || 0;
            return (
              <button
                key={upgrade.id}
                onClick={() => handleBuyUpgrade(upgrade.id)}
                disabled={!canAfford}
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
                  <div className="text-[10px] text-stone-500">+{upgrade.baseDPS} DPS</div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Center: Game Plate */}
        <section className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Ad Slot Top */}
          <div className="absolute top-4 w-full max-w-md h-20 bg-stone-200/50 rounded flex items-center justify-center text-[10px] text-stone-400 uppercase tracking-widest">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-6735039970151788"
                 data-ad-slot="horizontal-top"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>

          {/* Apple & Plate */}
          <div className="relative group cursor-pointer" onClick={handleClick}>
            {/* Plate */}
            <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full shadow-inner border-8 border-stone-200 flex items-center justify-center">
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
                <div className="absolute inset-0 bg-red-500 rounded-[40%] shadow-lg">
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
          <div className="mt-12 w-full max-w-xs">
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

          {/* Ad Slot Bottom */}
          <div className="absolute bottom-4 w-full max-w-md h-20 bg-stone-200/50 rounded flex items-center justify-center text-[10px] text-stone-400 uppercase tracking-widest">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-6735039970151788"
                 data-ad-slot="horizontal-bottom"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-xs text-stone-500">{t('stats_click_damage')}</span>
                <span className="font-mono font-bold">{engine.getClickDamage().toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-xs text-stone-500">{t('stats_idle_dps')}</span>
                <span className="font-mono font-bold">{engine.getTotalDPS().toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-xs text-stone-500">{t('total_eaten')}</span>
                <span className="font-mono font-bold">{state.totalApplesEaten.toLocaleString()}</span>
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
