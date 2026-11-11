'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/components/Game'), {
  ssr: false,
  loading: () => (
    <div role="status" aria-live="polite" className="abyss-loading">
      <span className="abyss-spinner" aria-hidden="true" />
      Loading...
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
