'use client';

import React from 'react';
import Link from 'next/link';
import { Github, BookOpen, Info } from 'lucide-react';

interface GameFooterProps {
  t: (key: string, params?: any) => string;
}

export default function GameFooter({ t }: GameFooterProps) {
  return (
    <footer className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-t border-stone-200/50 dark:border-stone-700/50 p-3 md:p-4 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-stone-400 dark:text-stone-500 z-10 gap-3 md:gap-2">
      <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
        <span className="font-medium">Apple of the Infinite Abyss</span>
        <a 
          href="https://github.com/ricardo-camilo-programador-frontend-web" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-stone-600 transition-colors"
        >
          <Github className="w-3 h-3 md:w-4 md:h-4" />
          GitHub
        </a>
        <a 
          href="https://ricardo-camilo-dev-frontend-web.netlify.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-stone-600 transition-colors hidden md:inline"
        >
          Portfolio
        </a>
        <Link href="/privacy" className="hover:text-stone-600 transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-stone-600 transition-colors">Terms</Link>
      </div>
      <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
        <Link 
          href="/apple-varieties" 
          className="flex items-center gap-1 hover:text-stone-600 transition-colors"
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
  );
}
