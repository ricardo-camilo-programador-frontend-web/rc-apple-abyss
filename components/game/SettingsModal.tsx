'use client';

import {
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
          className="abyss-backdrop"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            className="abyss-modal abyss-modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="abyss-modal-head">
              <h2 id="settings-title" className="font-bold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" aria-hidden="true" />
                {t('settings')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="abyss-close"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="abyss-modal-body space-y-6">
              {/* Theme section */}
              <ThemeToggle />

              {/* Sound section */}
              <div className="space-y-3">
                <span className="abyss-kicker flex items-center gap-2">
                  <Volume2 className="w-3 h-3" aria-hidden="true" />
                  {t('settings_sound')}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-pressed={state.settings.muted}
                    aria-label={state.settings.muted ? 'Unmute' : 'Mute'}
                    className={`abyss-icon-btn border ${state.settings.muted ? 'abyss-btn-danger' : ''}`}
                    style={{ borderColor: 'var(--line)' }}
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
                    aria-label={t('settings_sound')}
                    className="flex-1 accent-[var(--apple)]"
                  />
                </div>
              </div>

              {/* Language section */}
              <div className="space-y-3">
                <span id="language-label" className="abyss-kicker flex items-center gap-2">
                  <Languages className="w-3 h-3" aria-hidden="true" />
                  {t('settings_language')}
                </span>
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1"
                  role="group"
                  aria-labelledby="language-label"
                >
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => changeLanguage(language.code)}
                      aria-label={`Switch language to ${language.name}`}
                      aria-pressed={state.settings.language === language.code}
                      className="abyss-lang"
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ad Preferences section */}
              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <span className="abyss-kicker flex items-center gap-2">
                  <X className="w-3 h-3" aria-hidden="true" />
                  Ad Preferences
                </span>
                <button
                  type="button"
                  onClick={toggleAdsRemoved}
                  aria-pressed={adsRemoved}
                  className="abyss-card flex items-center justify-between gap-3"
                >
                  <div className="text-left">
                    <div className="font-bold text-sm">
                      {adsRemoved ? 'Ads Removed' : 'Remove Ads'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      {adsRemoved
                        ? 'Display ads are hidden. Rewarded ads still available.'
                        : 'Hide all display ads (banners). Rewarded ads remain optional.'}
                    </div>
                  </div>
                  <div
                    className="w-12 h-6 rounded-full relative"
                    style={{ background: adsRemoved ? 'var(--teal)' : 'var(--line)' }}
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
              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <span className="abyss-kicker flex items-center gap-2">
                  <Download className="w-3 h-3" aria-hidden="true" />
                  Save Management
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onExportSave}
                    className="abyss-btn abyss-btn-ghost"
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
                      aria-label="Paste save string"
                      aria-invalid={importError ? true : undefined}
                      className="abyss-input"
                    />
                    <button
                      type="button"
                      onClick={handleImportSave}
                      className="abyss-icon-btn border"
                      style={{ borderColor: 'var(--line)' }}
                      title="Import Save"
                      aria-label="Import save"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                  {importError && (
                    <p className="abyss-error" role="alert">
                      {importError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleResetGame}
                    className="abyss-btn abyss-btn-danger"
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
