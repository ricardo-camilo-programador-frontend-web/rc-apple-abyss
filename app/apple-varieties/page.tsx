'use client';

import { ArrowLeft, BookOpen, ExternalLink, Github, Info } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdsterraBanner from '@/components/AdsterraBanner';
import { GameEngine } from '@/lib/game/engine';
import type { Language } from '@/lib/game/types';

const APPLE_VARIETIES = [
  'ambrosia',
  'baldwin',
  'braeburn',
  'cameo',
  'cortland',
  'coxs_orange_pippin',
  'crabapple',
  'empire',
  'envy',
  'fuji',
  'golden_delicious',
  'granny_smith',
  'honeycrisp',
  'idared',
  'jazz',
  'jonagold',
  'jonathan',
  'macoun',
  'mcintosh',
  'mutsu',
  'northern_spy',
  'opal',
  'pacific_rose',
  'pink_lady',
  'red_delicious',
  'rome',
  'royal_gala',
  'snapdragon',
  'sonya',
  'sugarbee',
  'sweetango',
  'winter_banana',
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

  const t = (key: string, params?: Record<string, string | number>) =>
    engine.getLocalization().t(key, params);

  return (
    <div className="min-h-screen font-sans">
      {/* SEO Meta Tags (handled via Next.js Metadata API in layout or here via Head if needed, 
          but since it's a client component we use a simple approach or just rely on layout) */}
      <title>{`${t('apple_guide_title')} | Apple of the Infinite Abyss`}</title>
      <meta name="description" content={t('apple_guide_meta_description')} />

      {/* Header / Navigation */}
      <header className="abyss-guide-header">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="abyss-back">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Back to Game</span>
          </Link>
          <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--apple)' }}>
            <BookOpen className="w-5 h-5" aria-hidden="true" />
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
          <h1 className="abyss-title">{t('apple_guide_title')}</h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            {t('apple_guide_intro')}
          </p>
        </motion.section>

        {/* Infographic Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="abyss-sheet p-4 md:p-8 overflow-hidden"
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

          <div
            className="mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
            style={{ borderTop: '1px solid var(--line)', color: 'var(--muted)' }}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider text-[10px]">
                {t('apple_guide_source_title')}
              </span>
            </div>
            <a
              href="https://www.reddit.com/r/coolguides/comments/g77jhx/i_made_an_infographic_explaining_how-different/?tl=pt-br"
              target="_blank"
              rel="noopener noreferrer"
              className="abyss-btn abyss-btn-ghost w-auto"
            >
              <span>{t('apple_guide_source_credit')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.section>

        {/* Varieties Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
            <h2 className="abyss-kicker px-4">{t('apple_guide_varieties_title')}</h2>
            <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {APPLE_VARIETIES.map((id, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.1 }}
                className="abyss-variety p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{t(`apple_variety_${id}`)}</h3>
                  <span className="text-2xl">🍎</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {t(`apple_variety_${id}_desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <AdsterraBanner
          format="native"
          label={language === 'pt' ? 'Publicidade' : 'Advertisement'}
        />
      </main>

      {/* Footer */}
      <footer className="abyss-footer mt-16 !pl-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-bold text-xl" style={{ color: 'var(--apple)' }}>
              <span>APPLE INFINITY</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              © 2026 Educational Resource
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">Play Game</Link>
            <a
              href="https://ricardo-camilo-dev-frontend-web.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/ricardo-camilo-programador-frontend-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5" aria-hidden="true" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
