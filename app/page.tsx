'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/components/Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-stone-50 dark:bg-stone-900">
      <div className="animate-pulse text-stone-400">Loading...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <Game />
    </main>
  );
}
