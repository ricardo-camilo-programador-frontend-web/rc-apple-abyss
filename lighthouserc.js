/** @type {import('lighthouse-ci').LighthouseCIConfig} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm exec next start --hostname 127.0.0.1 --port 3417',
      startServerReadyPattern: 'Ready',
      url: ['http://127.0.0.1:3417/', 'http://127.0.0.1:3417/apple-varieties'],
      numberOfRuns: 2,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.85 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
