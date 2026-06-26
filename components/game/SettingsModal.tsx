'use client';

import React, { useState } from 'react';
import { GameState, Language } from '@/lib/game/types';
import { GameEngine } from '@/lib/game/engine';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Volume2,
  VolumeX,
  Languages,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  onClose: () => void;
  onStateUpdate: () => void;
  onImportSave: (str: string) => void;
  onResetGame: () => void;
  onExportSave: () => void;
}

const LANGUAGES: Language[] = [
  'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur',
  'id', 'de', 'ja', 'sw', 'mr', 'te', 'tr', 'ta', 'vi', 'ko',
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

  const toggleMute = () => {
    const newMuted = !state.settings.muted;
    engine.setMuted(newMuted);
    onStateUpdate();
  };

  const changeLanguage = (lang: Language) => {
    engine.setLanguage(lang);
    onStateUpdate();
  };

  const handleImportSave = () => {
    if (!importString.trim()) {
      setImportError('Please enter a save string.');
      return;
    }
    const success = engine.importSave(importString.trim());
    if (success) {
      onImportSave(importString.trim());
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
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
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
                    onChange={e => {
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
                  {LANGUAGES.map(lang => (
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
                      onChange={e => setImportString(e.target.value)}
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
                  {importError && (
                    <p className="text-xs text-red-500 font-medium">{importError}</p>
                  )}

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
