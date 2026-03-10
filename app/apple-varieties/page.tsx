'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Info, BookOpen } from 'lucide-react';
import { LocalizationSystem } from '@/lib/game/localization';
import { Language } from '@/lib/game/types';

const VARIETIES = [
  'ambrosia', 'baldwin', 'braeburn', 'cameo', 'cortland', 'coxs_orange_pippin', 
  'crabapple', 'empire', 'envy', 'fuji', 'golden_delicious', 'granny_smith', 
  'honeycrisp', 'idared', 'jazz', 'jonagold', 'jonathan', 'macoun', 'mcintosh', 
  'mutsu', 'northern_spy', 'opal', 'pacific_rose', 'pink_lady', 'red_delicious', 
  'rome', 'royal_gala', 'snapdragon', 'sonya', 'sugarbee', 'sweetango', 'winter_banana'
];

export default function AppleVarietiesPage() {
  const [mounted, setMounted] = useState(false);
  const [localization, setLocalization] = useState<LocalizationSystem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      // Load language from localStorage if available
      const saved = localStorage.getItem('apple_clicker_save');
      let initialLang: Language = 'en';
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.settings?.language) {
            initialLang = parsed.settings.language;
          }
        } catch (e) {
          console.error('Failed to parse save', e);
        }
      }
      setLocalization(new LocalizationSystem(initialLang));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !localization) return null;

  const t = (key: string) => localization.t(key);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      {/* SEO Meta Tags (handled by Next.js metadata if this was a server component, 
          but since we need localization state, we'll just use semantic HTML) */}
      
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-stone-500 hover:text-red-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game</span>
          </Link>
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <BookOpen className="w-5 h-5" />
            <span>Apple Guide</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-6 tracking-tight">
            {t('apple_guide_title')}
          </h1>
          
          <p className="text-xl text-stone-600 mb-12 leading-relaxed">
            {t('apple_guide_intro')}
          </p>

          <section className="mb-16">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
              <div className="relative aspect-[1080/1350] w-full">
                <Image
                  src="https://preview.redd.it/i-made-an-infographic-explaining-how-different-apple-v0-o2ypbjd9fru41.png?width=1080&crop=smart&auto=webp&s=97dfb851de6921382eaf504afd800897d8974a4a"
                  alt="Apple Varieties Infographic"
                  fill
                  className="object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-stone-100 rounded-xl border border-stone-200">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-1">
                  {t('apple_guide_source_title')}
                </h2>
                <p className="text-stone-600 text-sm">
                  {t('apple_guide_source_credit')}
                </p>
              </div>
              <a 
                href="https://www.reddit.com/r/coolguides/comments/g77jhx/i_made_an_infographic_explaining_how_different/?tl=pt-br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-stone-200 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
              >
                View on Reddit
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black text-stone-900 mb-8 flex items-center gap-3">
              <Info className="w-8 h-8 text-red-500" />
              {t('apple_guide_varieties_title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VARIETIES.map((variety, index) => (
                <motion.div
                  key={variety}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🍎
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 mb-2">
                        {t(`apple_variety_${variety}`)}
                      </h3>
                      <p className="text-stone-600 leading-snug text-sm">
                        {t(`apple_variety_${variety}_desc`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 pt-12 border-t border-stone-200 text-center text-stone-400 text-sm">
        <p>© 2026 Apple of the Infinite Abyss</p>
      </footer>
    </div>
  );
}
