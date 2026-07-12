import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxa11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

const tsExtension = ['ts', 'tsx'];

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignores
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.d.ts',
      '.github/**',
      'eslint-patch-bypass.cjs',
      'eslint-patch-stub.cjs',
      'lint.cjs',
    ],
  },

  // Base JavaScript/TypeScript config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        crypto: 'readonly',
        Image: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/no-default-export': 'off', // Next.js pages/components use default exports
    },
  },

  // React hooks rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // JSX a11y rules
  {
    files: ['**/*.tsx'],
    plugins: {
      'jsx-a11y': jsxa11y,
    },
    rules: {
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/button-has-type': 'off', // Many buttons don't need explicit type
    },
  },

  // Next.js specific rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    settings: {
      next: {
        rootDir: '.',
      },
    },
    rules: {
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
];
