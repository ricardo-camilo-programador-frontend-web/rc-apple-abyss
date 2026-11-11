'use client';

import { BookOpen, Github, Info } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface GameFooterProps {
  t: (key: string, params?: any) => string;
}

export default function GameFooter({ t }: GameFooterProps) {
  return (
    <footer className="abyss-footer">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <span className="font-semibold px-2">Apple of the Infinite Abyss</span>
        <a
          href="https://github.com/ricardo-camilo-programador-frontend-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="w-4 h-4" aria-hidden="true" />
          GitHub
        </a>
        <a
          href="https://ricardo-camilo-dev-frontend-web.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex"
        >
          Portfolio
        </a>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <Link href="/apple-varieties">
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          <span>{t('apple_guide_footer_link')}</span>
        </Link>
        <span className="inline-flex items-center gap-1 px-2">
          <Info className="w-3 h-3" aria-hidden="true" />
          <span>v1.0.0</span>
        </span>
      </div>
    </footer>
  );
}
