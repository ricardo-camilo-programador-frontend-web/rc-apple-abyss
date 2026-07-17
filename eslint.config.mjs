import { createRequire, register } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';

const require = createRequire(import.meta.url);
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const patchPath = require.resolve('@rushstack/eslint-patch/modern-module-resolution', {
  paths: [require.resolve('eslint-config-next')],
});

register(
  pathToFileURL(resolve(currentDirectory, 'eslint-patch-stub.cjs')),
  pathToFileURL(patchPath),
);

const compatibility = new FlatCompat({
  baseDirectory: currentDirectory,
});

export default defineConfig([
  ...compatibility.extends('next'),
  ...compatibility.extends('plugin:@typescript-eslint/recommended'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@next/next/no-img-element': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'dist/**'],
  },
  {
    files: [
      'app/apple-varieties/page.tsx',
      'components/AdSenseAd.tsx',
      'components/AdsterraAd.tsx',
      'components/game/AppleArea.tsx',
      'components/game/AscensionSidebar.tsx',
      'components/game/GameFooter.tsx',
      'components/game/GameHeader.tsx',
      'components/game/MobileNav.tsx',
      'components/game/OfflineModal.tsx',
      'components/game/SettingsModal.tsx',
      'components/game/SkillsModal.tsx',
      'components/game/StatsModal.tsx',
      'components/game/UpgradeCard.tsx',
      'components/game/UpgradeSidebar.tsx',
      'lib/ads/adsterra.ts',
      'lib/game/engine.ts',
      'lib/game/offline.ts',
      'lib/game/skills.ts',
      'tests/engine.test.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' },
  },
]);
