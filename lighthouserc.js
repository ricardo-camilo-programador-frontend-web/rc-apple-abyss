/** @type {import('lighthouse-ci').LighthouseCIConfig} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run start',
      url: ['http://localhost:3000/', 'http://localhost:3000/apple-varieties'],
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
