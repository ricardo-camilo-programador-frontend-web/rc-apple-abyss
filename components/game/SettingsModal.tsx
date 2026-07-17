'use client';

import {
  ChevronRight,
  Download,
  Languages,
  RefreshCw,
  Settings,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import ThemeToggle from '@/components/game/ThemeToggle';
import { useAdGuard } from '@/hooks/use-ad-guard';
import { analytics } from '@/lib/analytics';
import type { GameEngine } from '@/lib/game/engine';
import type { GameState, Language } from '@/lib/game/types';

interface SettingsModalProps {
  isOpen: boolean;
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  onClose: () => void;
  onStateUpdate: () => void;
  onImportSave: (saveString: string) => Promise<boolean>;
  onResetGame: () => void;
  onExportSave: () => void;
}

const LANGUAGES: Array<{ code: Language; name: string }> = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ur', name: 'اردو' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'sw', name: 'Kiswahili' },
  { code: 'mr', name: 'मराठी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'ko', name: '한국어' },
];

export default function SettingsModal({
  isOpen,
  state,
  engine,
  t,
  onClose,
  onStateUpdate,
  onImportSave,
  onResetGame,
  onExportSave,
}: SettingsModalProps) {
  const [importString, setImportString] = useState('');
  const [importError, setImportError] = useState('');
  const { adsRemoved, toggleAdsRemoved } = useAdGuard();

  const toggleMute = () => {
    const newMuted = !state.settings.muted;
    engine.setMuted(newMuted);
    onStateUpdate();
  };

  const changeLanguage = (lang: Language) => {
    engine.setLanguage(lang);
    analytics.languageChanged(lang);
    onStateUpdate();
  };

  const handleImportSave = async () => {
    if (!importString.trim()) {
      setImportError('Please enter a save string.');
      return;
    }
    const success = await onImportSave(importString.trim());
    if (success) {
      setImportString('');
      setImportError('');
    } else {
      setImportError('Invalid save string or corrupted data.');
    }
  };

  const handleResetGame = () => {
    if (confirm('Are you sure you want to completely reset your game? This cannot be undone!')) {
      onResetGame();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-stone-900 dark:text-stone-100 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('settings')}
              </h2>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Theme section */}
              <ThemeToggle />

              {/* Sound section */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2">
                  <Volume2 className="w-3 h-3" />
                  {t('settings_sound')}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      state.settings.muted
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    {state.settings.muted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={state.settings.volume}
                    onChange={(e) => {
                      engine.setVolume(parseFloat(e.target.value));
                      onStateUpdate();
                    }}
                    className="flex-1 accent-red-500"
                  />
                </div>
              </div>

              {/* Language section */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2">
                  <Languages className="w-3 h-3" />
                  {t('settings_language')}
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      aria-label={`Switch language to ${language.name}`}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                        state.settings.language === language.code
                          ? 'bg-red-500 text-white border-red-600 shadow-md'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ad Preferences section */}
              <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-700">
                <label className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2">
                  <X className="w-3 h-3" />
                  Ad Preferences
                </label>
                <button
                  onClick={toggleAdsRemoved}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    adsRemoved
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                      : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-left">
                    <div
                      className={`font-bold text-sm ${adsRemoved ? 'text-emerald-900 dark:text-emerald-300' : 'text-stone-700 dark:text-stone-200'}`}
                    >
                      {adsRemoved ? 'Ads Removed' : 'Remove Ads'}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {adsRemoved
                        ? 'Display ads are hidden. Rewarded ads still available.'
                        : 'Hide all display ads (banners). Rewarded ads remain optional.'}
                    </div>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      adsRemoved ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        adsRemoved ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Save Management section */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <label className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2">
                  <Download className="w-3 h-3" />
                  Save Management
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={onExportSave}
                    className="flex items-center justify-center gap-2 p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export Save
                  </button>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={importString}
                      onChange={(e) => setImportString(e.target.value)}
                      placeholder="Paste save string..."
                      className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-red-300"
                    />
                    <button
                      onClick={handleImportSave}
                      className="flex items-center justify-center p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                      title="Import Save"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                  {importError && <p className="text-xs text-red-500 font-medium">{importError}</p>}

                  <button
                    onClick={handleResetGame}
                    className="flex items-center justify-center gap-2 p-3 mt-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium text-sm border border-red-100"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Hard Reset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
