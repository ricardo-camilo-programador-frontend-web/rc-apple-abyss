'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ExternalLink, 
  BookOpen, 
  Info, 
  ArrowLeft,
  Github
} from 'lucide-react';
import { GameEngine } from '@/lib/game/engine';
import { Language } from '@/lib/game/types';
import AdsterraAd from '@/components/AdsterraAd';
import { AdFormat } from '@/lib/ads/adsterra';

const APPLE_VARIETIES = [
  'ambrosia', 'baldwin', 'braeburn', 'cameo', 'cortland', 'coxs_orange_pippin',
  'crabapple', 'empire', 'envy', 'fuji', 'golden_delicious', 'granny_smith',
  'honeycrisp', 'idared', 'jazz', 'jonagold', 'jonathan', 'macoun', 'mcintosh',
  'mutsu', 'northern_spy', 'opal', 'pacific_rose', 'pink_lady', 'red_delicious',
  'rome', 'royal_gala', 'snapdragon', 'sonya', 'sugarbee', 'sweetango', 'winter_banana'
];

export default function AppleVarietiesPage() {
  const [engine] = useState(() => new GameEngine());
  const [language, setLanguage] = useState<Language>(() => engine.getState().settings.language);

  useEffect(() => {
    // Sync language if it changes in the engine (though unlikely on this page)
    const interval = setInterval(() => {
      const currentLang = engine.getState().settings.language;
      if (currentLang !== language) {
        setLanguage(currentLang);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [engine, language]);

  const t = (key: string, params?: any) => engine.getLocalization().t(key, params);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-sans selection:bg-red-200">
      {/* SEO Meta Tags (handled via Next.js Metadata API in layout or here via Head if needed, 
          but since it's a client component we use a simple approach or just rely on layout) */}
      <title>{`${t('apple_guide_title')} | Apple of the Infinite Abyss`}</title>
      <meta name="description" content={t('apple_guide_meta_description')} />

      {/* Adsterra Global Formats */}
      <AdsterraAd format={AdFormat.POPUNDER} />
      <AdsterraAd format={AdFormat.SOCIAL_BAR} />

      {/* Header / Navigation */}
      <header className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-red-600 transition-colors font-medium group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Game</span>
          </Link>
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Educational Guide</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
            {t('apple_guide_title')}
          </h1>
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {t('apple_guide_intro')}
          </p>
        </motion.section>

        {/* Top Ad */}
        <AdsterraAd format={AdFormat.DISPLAY_BANNER} className="w-full max-w-3xl mx-auto" />

        {/* Infographic Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-stone-800 p-4 md:p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden"
        >
          <div className="relative aspect-[1080/1350] w-full max-w-3xl mx-auto">
            <img 
              src="https://preview.redd.it/i-made-an-infographic-explaining-how-different-apple-v0-o2ypbjd9fru41.png?width=1080&crop=smart&auto=webp&s=97dfb851de6921382eaf504afd800897d8974a4a"
              alt="Apple Varieties Etymology Infographic"
              className="absolute inset-0 w-full h-full object-contain rounded-xl"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="mt-8 pt-8 border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider text-[10px]">{t('apple_guide_source_title')}</span>
            </div>
            <a 
              href="https://www.reddit.com/r/coolguides/comments/g77jhx/i_made_an_infographic_explaining_how-different/?tl=pt-br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-red-600 transition-colors bg-stone-50 dark:bg-stone-800 px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700"
            >
              <span>{t('apple_guide_source_credit')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.section>

        {/* Middle Ad */}
        <AdsterraAd format={AdFormat.NATIVE_BANNER} className="w-full max-w-4xl mx-auto" />

        {/* Varieties Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
            <h2 className="text-2xl font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-4">
              {t('apple_guide_varieties_title')}
            </h2>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {APPLE_VARIETIES.map((id, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.1 }}
                className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200 group-hover:text-red-600 transition-colors">
                    {t(`apple_variety_${id}`)}
                  </h3>
                  <span className="text-2xl">🍎</span>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {t(`apple_variety_${id}_desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom Ad */}
        <AdsterraAd format={AdFormat.DISPLAY_BANNER} className="w-full max-w-3xl mx-auto" />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 py-12 mt-24">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-red-600 font-black text-xl">
              <span>APPLE INFINITY</span>
            </div>
            <p className="text-sm text-stone-400 dark:text-stone-500">© 2026 Educational Resource</p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/" className="text-stone-500 dark:text-stone-400 hover:text-red-600 transition-colors font-medium">
              Play Game
            </Link>
            <a 
              href="https://ricardo-camilo-dev-frontend-web.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-stone-500 dark:text-stone-400 hover:text-red-600 transition-colors font-medium"
            >
              Portfolio
            </a>
            <a 
              href="https://github.com/ricardo-camilo-programador-frontend-web" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
