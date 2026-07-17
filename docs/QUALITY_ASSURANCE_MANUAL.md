# Quality Assurance Manual — Apple of the Infinite Abyss

> **Derived from:** SGS_WEB (`Consir-Sistemas-e-Sites/SGS_WEB`) quality engineering
> **Target project:** `rc-apple-abyss` (Next.js + Tailwind CSS v4)
> **Status:** Implementation guide — ready for execution
> **Language:** English (global collaboration standard)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Comparison: SGS_WEB vs rc-apple-abyss](#2-architecture-comparison)
3. [CI Pipeline](#3-ci-pipeline)
4. [Biome Configuration](#4-biome-configuration)
5. [ESLint (Type-Checked Rules)](#5-eslint-type-checked-rules)
6. [Secret Scanning](#6-secret-scanning)
7. [SonarQube Community Edition](#7-sonarqube-community-edition)
8. [Git Hooks (Husky)](#8-git-hooks-husky)
9. [Commit Convention (Gitmoji)](#9-commit-convention-gitmoji)
10. [Release & Versioning Strategy](#10-release--versioning-strategy)
11. [PR Auto-Triage & Labeling](#11-pr-auto-triage--labeling)
12. [CodeRabbit AI Review](#12-coderabbit-ai-review)
13. [Preview Deploys](#13-preview-deploys)
14. [Lighthouse / Performance Audits](#14-lighthouse--performance-audits)
15. [Branch Protection & Workflow Rules](#15-branch-protection--workflow-rules)
16. [Implementation Checklist](#16-implementation-checklist)
17. [Maintenance & Governance](#17-maintenance--governance)

---

## 1. Executive Summary

SGS_WEB implements a **7-layer quality gate** system. This manual documents each layer and provides step-by-step instructions to replicate them in `rc-apple-abyss`.

| # | Quality Gate | SGS_WEB Status | rc-apple-abyss Current | Target |
|---|---|---|---|---|
| 1 | CI Pipeline (parallel jobs) | ✅ 6 jobs | ⚠️ Basic (3 jobs, no cache, v3 actions) | Full 6-job parallel |
| 2 | Biome Linter + Formatter | ✅ biome.json v2.2.4 | ❌ None | biome.json adapted |
| 3 | ESLint (type-checked) | ✅ Vue lifecycle rules | ⚠️ `eslint-config-next` only | Next.js + strict rules |
| 4 | Secret Scanning | ✅ TruffleHog + Gitleaks + custom | ❌ None | Gitleaks + TruffleHog |
| 5 | SonarQube Community | ✅ Docker scanner | ⚠️ Config exists, not integrated | Full integration |
| 6 | Git Hooks (Husky) | ✅ pre-commit + commit-msg + pre-push | ❌ None | All 3 hooks |
| 7 | PR Auto-Triage | ✅ labeler + risk + size | ❌ None | Full triage |

**Additional SGS_WEB mechanisms to replicate:**
- Commit convention enforcement (gitmoji `:emoji: type(scope): description`)
- Preview deploys per PR (Netlify)
- CodeRabbit AI review with branch flow enforcement
- Turborepo task orchestration with caching
- Dead dependency detection (knip)
- Chunk validation (lazy-loaded vendor isolation)

---

## 2. Architecture Comparison

| Aspect | SGS_WEB | rc-apple-abyss |
|---|---|---|
| Framework | Vue 3 + Vite | Next.js 15 |
| Language | TypeScript ~5.7 | TypeScript |
| Styling | TailwindCSS v4 + DaisyUI | TailwindCSS v4 |
| Package Manager | pnpm 11 | pnpm |
| Linter | Biome 2.2.4 + ESLint | ESLint (next config only) |
| Formatter | Biome + Prettier | None |
| Test Runner | Vitest + Playwright | Vitest |
| CI Runner | self-hosted Linux | self-hosted |
| Deploy | self-hosted server | Netlify |
| Orchestration | Turborepo | None |

**Key adaptation:** rc-apple-abyss is Next.js (not Vue), so Vue-specific lint rules are replaced with React/Next.js equivalents. Turborepo is optional for a single-package repo.

---

## 3. CI Pipeline

### SGS_WEB Pattern (6 parallel + serial jobs)

```
push/PR → ┬─ secret-scan (TruffleHog)
          ├─ security (package.json validation + commit lint)
          │
          └─ validate (needs: secret + security)
              ├─ lint-duplicate-v-model
              ├─ ESLint (type-checked)
              ├─ Turborepo: type-check + biome + build
              ├─ chunk validation
              ├─ knip (dead deps)
              └─ upload artifacts
          └─ commit-lint (needs: secret + security, PR only)
          └─ validate-pr-base (PR only)
          └─ preview (needs: validate, PR only)
```

### rc-apple-abyss Target Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ──────────────────────────────────────────────
  # 1. Secret scan (parallel)
  # ──────────────────────────────────────────────
  secret-scan:
    name: Secret Scan
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # ──────────────────────────────────────────────
  # 2. Security audit (parallel)
  # ──────────────────────────────────────────────
  security:
    name: Security
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Audit vulnerabilities
        run: pnpm audit --audit-level moderate

  # ──────────────────────────────────────────────
  # 3. Validate (serial after secret + security)
  # ──────────────────────────────────────────────
  validate:
    name: Validate
    runs-on: self-hosted
    needs: [secret-scan, security]
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Biome check
        run: pnpm run biome

      - name: ESLint (type-checked)
        run: pnpm run eslint

      - name: TypeScript check
        run: pnpm run type-check

      - name: Build
        run: pnpm run build

      - name: Tests
        run: pnpm run test

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-dist
          path: .next/
          retention-days: 3

  # ──────────────────────────────────────────────
  # 4. Commit lint (PR only)
  # ──────────────────────────────────────────────
  commit-lint:
    name: Commit Lint
    runs-on: self-hosted
    needs: [secret-scan, security]
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Validate gitmoji convention
        shell: bash
        run: |
          BASE_SHA="${{ github.event.pull_request.base.sha }}"
          HEAD_SHA="${{ github.event.pull_request.head.sha }}"
          PATTERN="^:[a-z_]+:\s[a-z]+([a-z-]*)?(\([a-zA-Z0-9/_.-]+\)): .+"

          echo "Validating commits from $BASE_SHA..$HEAD_SHA"
          FAILED=0

          for COMMIT in $(git rev-list "$BASE_SHA..$HEAD_SHA"); do
            MSG=$(git log -1 --format="%s" "$COMMIT")
            PARENTS=$(git rev-list --parents -1 "$COMMIT" | wc -w)
            if [ "$PARENTS" -gt 2 ]; then
              echo "  Skipping merge commit: $MSG"
              continue
            fi
            if ! echo "$MSG" | grep -qE "$PATTERN"; then
              echo "  Invalid commit: $MSG"
              echo "   Expected: :emoji: type(scope): description"
              FAILED=1
            fi
          done

          if [ "$FAILED" -eq 1 ]; then
            echo "Some commits do not follow gitmoji convention."
            exit 1
          fi
          echo "All commits valid!"

  # ──────────────────────────────────────────────
  # 5. Validate PR base (PR only)
  # ──────────────────────────────────────────────
  validate-pr-base:
    name: Validate PR Base
    runs-on: self-hosted
    if: github.event_name == 'pull_request'
    steps:
      - name: Check PR target branch
        run: |
          BASE="${{ github.base_ref }}"
          HEAD="${{ github.head_ref }}"
          echo "PR: $HEAD -> $BASE"
          if [ "$BASE" = "main" ] || [ "$BASE" = "master" ]; then
            if [ "$HEAD" != "develop" ]; then
              echo "PRs to $BASE are only allowed from develop."
              exit 1
            fi
          fi
          echo "PR base validation passed."

  # ──────────────────────────────────────────────
  # 6. Preview Deploy (PR only, needs validate)
  # ──────────────────────────────────────────────
  preview:
    name: Preview Deploy
    runs-on: self-hosted
    needs: [validate]
    if: always() && github.event_name == 'pull_request' && needs.validate.result != 'failure'
    timeout-minutes: 5
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: '.next'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from PR #${{ github.event.pull_request.number }}"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Success Criteria
- All 6 jobs must pass (except `preview` which is informational)
- `secret-scan` and `security` run in parallel
- `validate` depends on both passing
- Build artifacts are uploaded for deploy pipeline
- Commit lint validates every non-merge commit

---

## 4. Biome Configuration

### Step 1: Install

```bash
pnpm add -D @biomejs/biome
```

### Step 2: Create `biome.json`

Adapted from SGS_WEB for Next.js/React:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": [
      "**",
      "!**/.next/",
      "!**/node_modules",
      "!**/coverage",
      "!**/dist",
      "!**/*.d.ts",
      "!**/.github/",
      "!**/tsconfig.tsbuildinfo"
    ]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100,
    "attributePosition": "auto"
  },
  "linter": {
    "enabled": true,
    "includes": ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "useParseIntRadix": "error",
        "noUnusedImports": "error",
        "noUnusedVariables": {
          "level": "error",
          "options": { "ignoreRestSiblings": true }
        }
      },
      "style": {
        "useConst": "warn",
        "useTemplate": "warn",
        "noNonNullAssertion": "warn",
        "useImportType": "warn",
        "useConsistentArrayType": {
          "level": "error",
          "options": { "syntax": "generic" }
        }
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noArrayIndexKey": "warn",
        "noImplicitAnyLet": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "enabled": true,
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "all",
      "quoteProperties": "preserve",
      "arrowParentheses": "asNeeded",
      "operatorLinebreak": "before",
      "lineEnding": "lf"
    }
  }
}
```

### Step 3: Create `.biomeignore`

```
.next/
node_modules/
dist/
coverage/
*.d.ts
tsconfig.tsbuildinfo
.github/
```

### Step 4: Add npm scripts to `package.json`

```jsonc
{
  "scripts": {
    "biome": "biome check .",
    "biome:fix": "biome check --write --unsafe .",
    "type-check": "tsc --noEmit",
    "validate": "pnpm run type-check && pnpm run biome && pnpm run build",
    "lint": "biome check .",
    "lint:fix": "biome check --write --unsafe ."
  }
}
```

### Success Criteria
- `pnpm run biome` exits 0 on clean code
- `pnpm run biome:fix` auto-corrects formatting and safe lint issues
- `noExplicitAny` is enforced as error
- `noUnusedImports` is enforced as error

---

## 5. ESLint (Type-Checked Rules)

Biome handles formatting and basic linting. ESLint adds **type-checked rules** that Biome cannot provide (React hooks, Next.js specifics).

### Step 1: Install

```bash
pnpm add -D eslint eslint-config-next @typescript-eslint/eslint-plugin
```

### Step 2: Create `eslint.config.mjs`

```js
import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    rules: {
      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true }
      ],

      // Next.js
      '@next/next/no-img-element': 'warn',
      '@next/next/no-page-custom-font': 'warn',

      // Best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    }
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', '*.config.*']
  }
]
```

### Step 3: Add script

```jsonc
{
  "scripts": {
    "eslint": "eslint . --max-warnings 0"
  }
}
```

### Success Criteria
- `pnpm run eslint` exits 0
- React hooks rules are enforced
- `@typescript-eslint/no-explicit-any` is error
- Next.js-specific rules are active

---

## 6. Secret Scanning

### Step 1: Create `.gitleaks.toml`

Adapted from SGS_WEB with project-specific rules:

```toml
title = "rc-apple-abyss Gitleaks Config"

# Custom rules for this project
[[rules]]
id = "adsterra-publisher-id"
description = "Adsterra Publisher ID leaked"
regex = '''adsterra[_-]?publisher[_-]?id\s*[:=]\s*['"]?[a-zA-Z0-9]{10,}['"]?'''
tags = ["adsterra", "secret"]

[[rules]]
id = "adsense-client-id"
description = "Google AdSense Client ID"
regex = '''ca-pub-[0-9]{16}'''
tags = ["adsense", "secret"]

[[rules]]
id = "gemini-api-key"
description = "Gemini API Key"
regex = '''AIza[a-zA-Z0-9_-]{35}'''
tags = ["gemini", "api-key"]

[[rules]]
id = "jwt-secret-hardcoded"
description = "JWT Secret hardcoded"
regex = '''(?i)jwt[_-]?secret\s*[:=]\s*['"]([^'"]{8,})['"]'''
tags = ["jwt", "secret"]

[[rules]]
id = "private-key-inline"
description = "Private key embedded in code"
regex = '''-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'''
tags = ["private-key"]

[allowlist]
description = "Global allowlist"
paths = [
  '''(^|/)\.env\.example$''',
  '''(^|/)pnpm-lock\.yaml$''',
  '''(^|/)node_modules/''',
  '''(^|/)\.next/''',
]
regexes = [
  '''(?i)your[_-]?example[_-]?key''',
  '''(?i)test_mock_[a-zA-Z0-9_]*''',
]
```

### Step 2: Add to CI

Already included in the CI pipeline above (Section 3, job `secret-scan`).

### Step 3: Local pre-commit hook

Included in Husky pre-commit (Section 8).

### Success Criteria
- Gitleaks runs on every push and PR
- Custom rules detect project-specific secrets (Adsterra, AdSense, Gemini)
- False positives are documented in allowlist with comments
- No secret ever reaches `main` or `develop`

---

## 7. SonarQube Community Edition

### Current State

rc-apple-abyss already has `sonar-project.properties`. The CI pipeline runs the scanner but uses a local binary. SGS_WEB uses Docker-based scanning with availability checks.

### Step 1: Update `sonar-project.properties`

```properties
sonar.projectKey=apple-of-the-infinite-abyss
sonar.projectName=Apple of the Infinite Abyss
sonar.projectVersion=0.0.0

# Source directories for Next.js
sonar.sources=lib,components,app,hooks
sonar.exclusions=**/node_modules/**,**/.next/**,**/coverage/**,**/*.spec.ts,**/*.test.ts,**/tests/**,*.tsbuildinfo,**/*.d.ts

# Test exclusions
sonar.test.exclusions=**/node_modules/**,**/.next/**,**/*.spec.ts,**/*.test.ts,**/tests/**

# Coverage
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Token and URL via environment: SONAR_TOKEN, SONAR_HOST_URL
```

### Step 2: Update CI job

```yaml
  sonar:
    name: SonarQube Analysis
    runs-on: self-hosted
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # SonarQube needs blame history
      - name: Check SonarQube availability
        id: sonar_check
        continue-on-error: true
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        run: |
          if [ -z "$SONAR_TOKEN" ] || [ -z "$SONAR_HOST_URL" ]; then
            echo "::warning::SONAR_TOKEN or SONAR_HOST_URL not configured."
            exit 1
          fi
          if ! curl -f -s --max-time 10 "$SONAR_HOST_URL/api/system/status" >/dev/null 2>&1; then
            echo "::warning::SonarQube unavailable at $SONAR_HOST_URL."
            exit 1
          fi
      - name: SonarQube Scan
        if: steps.sonar_check.outcome == 'success'
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        run: |
          docker run --rm \
            --network=host \
            -v "$PWD:/usr/src" \
            -w /usr/src \
            sonarsource/sonar-scanner-cli:latest \
            -Dsonar.token="$SONAR_TOKEN" \
            -Dsonar.host.url="$SONAR_HOST_URL"
```

### Success Criteria
- SonarQube runs with `continue-on-error: true` (non-blocking but visible)
- Availability check prevents CI failures when SonarQube is down
- Dashboard link posted as PR comment
- New code quality gate tracked over time

---

## 8. Git Hooks (Husky)

### Step 1: Install

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

### Step 2: `.husky/pre-commit`

```sh
#!/usr/bin/env sh
set -eu

echo "🔍 Pre-commit: running quality checks..."

# 1. Check for merge conflict markers
if git diff --cached --name-only --diff-filter=ACM -z | xargs -0 grep -lP '^(<<<<<<<|=======|>>>>>>>)' 2>/dev/null; then
  echo "❌ Merge conflict markers found in staged files"
  exit 1
fi

# 2. Lint-staged (Biome on staged files only)
npx lint-staged

# 3. Gitleaks quick scan (staged files only)
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --redact --config .gitleaks.toml || {
    echo "❌ Gitleaks detected potential secrets"
    exit 1
  }
fi

echo "✅ All pre-commit checks passed"
```

### Step 3: `.husky/commit-msg`

```sh
#!/usr/bin/env sh
commit_msg=$(cat "$1")

# Skip for merge, revert, fixup, squash
case "$commit_msg" in
  Merge*|Revert*|fixup!*|squash!*) exit 0 ;;
esac

pattern="^:[a-z_]+:\s[a-z]+([a-z-]*)?(\([a-zA-Z0-9/_.-]+\)): .+"

if echo "$commit_msg" | grep -qE "$pattern"; then
  exit 0
fi

echo ""
echo "❌ Invalid commit message"
echo "   Format: :emoji: type(scope): description"
echo "   Example: :sparkles: feat(auth): add OAuth2 support"
echo ""
echo "   Your message: $(echo "$commit_msg" | head -1)"
exit 1
```

### Step 4: `.husky/pre-push`

```sh
#!/usr/bin/env sh
echo "🔄 Pre-push: running full validation..."

pnpm run type-check && pnpm run biome && pnpm run build

if [ $? -ne 0 ]; then
  echo "❌ Validation failed! Fix errors before pushing."
  echo "💡 Run: pnpm run validate"
  exit 1
fi

echo "✅ All checks passed"
```

### Step 5: Configure `lint-staged` in `package.json`

```jsonc
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "biome check --write --no-errors-on-unmatched"
    ],
    "*.{json,css,html}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

### Success Criteria
- `pre-commit`: lint-staged + gitleaks + conflict markers
- `commit-msg`: gitmoji pattern enforced
- `pre-push`: full pipeline (type-check + biome + build)
- Hooks are POSIX sh compatible

---

## 9. Commit Convention (Gitmoji)

### Format

```
:emoji: type(scope): description
```

### Allowed Types

| Type | Emoji | Use Case |
|---|---|---|
| `feat` | `:sparkles:` | New feature |
| `fix` | `:bug:` | Bug fix |
| `refactor` | `:recycle:` | Code refactoring |
| `docs` | `:memo:` | Documentation |
| `style` | `:art:` | Formatting/styling |
| `test` | `:test_tube:` | Tests |
| `chore` | `:wrench:` | Maintenance/tooling |
| `perf` | `:zap:` | Performance |
| `ci` | `:construction_worker:` | CI/CD changes |
| `build` | `:package:` | Build system |
| `security` | `:lock:` | Security fix |
| `revert` | `:rewind:` | Revert commit |

### Examples

```
:sparkles: feat(auth): add Google OAuth login
:bug: fix(engine): correct apple HP calculation on stage change
:recycle: refactor(Game): decompose monolith into 16 components
:lock: security(save): add SHA-256 checksum to save system
:test_tube: test(engine): add 42 unit tests for GameEngine
```

### Enforcement

- **Husky `commit-msg` hook**: blocks invalid commits locally
- **CI `commit-lint` job**: blocks invalid commits on PR

---

## 10. Release & Versioning Strategy

### SGS_WEB Pattern

- Version in `package.json` (`0.63.4`)
- On push to `master`: auto-create lightweight git tag `v0.63.4`
- Validate semver format `v0.X.Y`
- Create GitHub Release with auto-generated notes
- Manual override via `workflow_dispatch` with version input

### rc-apple-abyss Target

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version (ex: v1.0.0). Omit to use package.json.'
        required: false

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write

jobs:
  release:
    runs-on: self-hosted
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Determine version
        id: version
        env:
          INPUT_VERSION: ${{ github.event.inputs.version }}
        run: |
          if [ -n "$INPUT_VERSION" ]; then
            VERSION="$INPUT_VERSION"
          else
            RAW=$(node -p "require('./package.json').version || '0.0.0'")
            VERSION="v${RAW}"
          fi

          if ! echo "$VERSION" | grep -qE '^v[0-9]+\.[0-9]+\.[0-9]+$'; then
            echo "::error::Invalid version: $VERSION (expected v0.X.Y)"
            exit 1
          fi

          echo "version=$VERSION" >> "$GITHUB_OUTPUT"

      - name: Check if tag exists
        id: check
        run: |
          TAG="${{ steps.version.outputs.version }}"
          if git tag -l "$TAG" | grep -q "$TAG"; then
            echo "exists=true" >> "$GITHUB_OUTPUT"
          else
            echo "exists=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Create and push tag
        if: steps.check.outputs.exists == 'false'
        run: |
          TAG="${{ steps.version.outputs.version }}"
          git tag "$TAG" HEAD
          git push origin "$TAG"

      - name: Create GitHub Release
        if: steps.check.outputs.exists == 'false'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG="${{ steps.version.outputs.version }}"
          gh release create "$TAG" --title "$TAG" --generate-notes
```

### Success Criteria
- Tag format: `vX.Y.Z` (semver)
- No duplicate tags (idempotent)
- GitHub Release auto-created with generated notes
- Manual version override available via dispatch

---

## 11. PR Auto-Triage & Labeling

### Step 1: Create `.github/labeler.yml`

```yaml
# Auto-label PRs by changed files
frontend:
  - changed-files:
    - any-glob-to-any-file: ["app/**", "components/**", "hooks/**", "lib/**"]

config:
  - changed-files:
    - any-glob-to-any-file: [".github/**", "*.config.*", "tsconfig.*"]

documentation:
  - changed-files:
    - any-glob-to-any-file: ["**/*.md"]

tests:
  - changed-files:
    - any-glob-to-any-file: ["**/*.test.*", "**/*.spec.*"]

dependencies:
  - changed-files:
    - any-glob-to-any-file: ["**/package.json", "**/pnpm-lock.yaml"]
```

### Step 2: Create `.github/workflows/pr-triage.yml`

```yaml
name: PR Auto-Triage

on:
  pull_request:
    types: [opened, ready_for_review, synchronize]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Auto-label PR
        uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          configuration-path: .github/labeler.yml

      - name: Risk assessment + size label
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_NUMBER=${{ github.event.pull_request.number }}
          REPO=${{ github.repository }}

          CHANGED_FILES=$(gh pr diff "$PR_NUMBER" --repo "$REPO" --stat 2>/dev/null || echo "")
          TOTAL_LINES=$(echo "$CHANGED_FILES" | tail -1 | awk '{print $4+$6}' | grep -oE '[0-9]+' || echo "0")

          # Risk level
          if [[ "$TOTAL_LINES" -gt 500 ]]; then
            RISK="high"; RISK_COLOR="🔴"
          elif [[ "$TOTAL_LINES" -gt 200 ]]; then
            RISK="medium"; RISK_COLOR="🟡"
          else
            RISK="low"; RISK_COLOR="🟢"
          fi

          # Size label
          if [[ "$TOTAL_LINES" -lt 50 ]]; then SIZE="size/XS"
          elif [[ "$TOTAL_LINES" -lt 150 ]]; then SIZE="size/S"
          elif [[ "$TOTAL_LINES" -lt 300 ]]; then SIZE="size/M"
          elif [[ "$TOTAL_LINES" -lt 500 ]]; then SIZE="size/L"
          else SIZE="size/XL"
          fi

          for old in "size/XS" "size/S" "size/M" "size/L" "size/XL"; do
            gh pr edit "$PR_NUMBER" --repo "$REPO" --remove-label "$old" 2>/dev/null || true
          done
          gh pr edit "$PR_NUMBER" --repo "$REPO" --add-label "$SIZE" 2>/dev/null || true
          gh pr edit "$PR_NUMBER" --repo "$REPO" --add-label "risk:$RISK" 2>/dev/null || true

          cat <<EOF | gh pr comment "$PR_NUMBER" --repo "$REPO" --body-file - 2>/dev/null || true
          ## 🤖 PR Auto-Triage
          **Risk Level:** $RISK_COLOR **$RISK** ($TOTAL_LINES lines changed)
          **Size:** $SIZE
          ---
          *Auto-generated by PR Auto-Triage workflow*
EOF
```

### Success Criteria
- Every PR gets auto-labeled by scope (frontend, config, docs, tests, deps)
- Risk level comment posted automatically
- Size label applied and kept in sync across pushes

---

## 12. CodeRabbit AI Review

### Step 1: Create `.coderabbit.yaml`

```yaml
# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json
language: 'en'
tone_instructions: 'direct, technical, focus on real solutions'

reviews:
  enabled: true
  auto_review:
    enabled: true
    base_branches: ['.*']
    ignore_labels: ['skip-review', 'dependencies']

  path_filters: ['**/*']
  exclude_path_filters:
    - '**/*.md'
    - '**/*.txt'
    - 'pnpm-lock.yaml'
    - '**/*.min.js'

  review_status: true
  auto_review_threshold: 0
  max_files_to_review: 1000
  comment_style: 'multiline'
  request_changes_workflow: true

  path_instructions:
    - path: '**/*'
      instructions: |
        - Prioritize readability, maintainability, and performance.
        - Apply Clean Code and DRY principles.
        - Use clear, intentional naming.
        - Avoid premature micro-optimizations.
        - Avoid unnecessary comments; prefer self-explanatory code.
        - Avoid using `any` type.
    - path: '**/*.{ts,tsx}'
      instructions: |
        - Ensure proper TypeScript strict typing.
        - Explicit types on public APIs (functions/exports).
        - Well-defined generics.

  rules:
    - name: "PR to main must come from develop"
      if:
        base_branch: "main"
        head_branch_not: "develop"
      action:
        request_changes: true
        comment: |
          ❌ **Invalid merge flow**
          PRs to `main` must come from `develop`.
          Flow: `feature/* → develop → main`

chat:
  enabled: true

knowledge_base:
  enabled: true
```

### Success Criteria
- CodeRabbit reviews every PR automatically
- Branch flow enforcement: feature → develop → main
- Language set to English for global collaboration

---

## 13. Preview Deploys

Already configured in the CI pipeline (Section 3, job `preview`). Uses Netlify to deploy a preview URL per PR, commented automatically.

### Required Secrets

```
NETLIFY_AUTH_TOKEN — Netlify personal access token
NETLIFY_SITE_ID — Netlify site ID for the project
```

### Success Criteria
- Every PR gets a preview URL
- URL is posted as a PR comment
- Preview updates on every push to the PR

---

## 14. Lighthouse / Performance Audits

SGS_WEB does not have Lighthouse CI configured (noted as a gap). For rc-apple-abyss:

### Step 1: Install

```bash
pnpm add -D @lhci/cli
```

### Step 2: Create `lighthouserc.js`

```js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/apple-varieties',
      ],
      numberOfRuns: 3,
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
}
```

### Step 3: Add CI job (optional, non-blocking)

```yaml
  lighthouse:
    name: Lighthouse Audit
    runs-on: self-hosted
    needs: [validate]
    if: always() && needs.validate.result != 'failure'
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - name: Run Lighthouse CI
        run: pnpm exec lhci autorun
```

### Success Criteria
- Performance score ≥ 80
- Accessibility score ≥ 90 (enforced as error)
- Runs on every successful build
- Results uploaded to temporary public storage for review

---

## 15. Branch Protection & Workflow Rules

### Branch Protection Rules (GitHub Settings)

Configure in: **Settings → Branches → Branch protection rules**

#### `main` branch:
- ✅ Require pull request before merging
- ✅ Require status checks: `secret-scan`, `security`, `validate`, `commit-lint`
- ✅ Require branches to be up to date before merging
- ✅ Only allow merges from `develop` (enforced by CI + CodeRabbit)
- ✅ Do not allow force pushes
- ✅ Require linear history

#### `develop` branch:
- ✅ Require pull request before merging
- ✅ Require status checks: `secret-scan`, `security`, `validate`
- ✅ Allow force pushes (for rebases)

### Git Flow

```
feature/* ──→ develop ──→ main
   ↑            ↑          ↑
 PR (gitmoji)  PR (only   Tag + Release
               develop)
```

### Success Criteria
- No direct pushes to `main` or `develop`
- All changes via PR with passing CI
- `main` only receives merges from `develop`

---

## 16. Implementation Checklist

Execute in order. Each step has a verification command.

### Phase 1: Linting & Formatting

- [ ] **Install Biome**: `pnpm add -D @biomejs/biome`
- [ ] **Create `biome.json`**: Copy from Section 4
- [ ] **Create `.biomeignore`**: Copy from Section 4
- [ ] **Add scripts to `package.json`**: `biome`, `biome:fix`, `type-check`, `validate`
- [ ] **Run**: `pnpm run biome:fix` — should auto-fix all issues
- [ ] **Verify**: `pnpm run biome` — should exit 0
- [ ] **Configure ESLint**: Create `eslint.config.mjs` from Section 5
- [ ] **Add script**: `eslint` to `package.json`
- [ ] **Verify**: `pnpm run eslint` — should exit 0

### Phase 2: Secret Scanning

- [ ] **Create `.gitleaks.toml`**: Copy from Section 6
- [ ] **Install gitleaks**: `brew install gitleaks` or `go install github.com/gitleaks/gitleaks/v8@latest`
- [ ] **Verify**: `gitleaks detect --config .gitleaks.toml` — should find 0 leaks
- [ ] **Add to CI**: job `secret-scan` in CI pipeline

### Phase 3: Git Hooks

- [ ] **Install Husky**: `pnpm add -D husky lint-staged && pnpm exec husky init`
- [ ] **Create `.husky/pre-commit`**: Copy from Section 8
- [ ] **Create `.husky/commit-msg`**: Copy from Section 8
- [ ] **Create `.husky/pre-push`**: Copy from Section 8
- [ ] **Configure `lint-staged`** in `package.json`: Copy from Section 8
- [ ] **Verify**: Make a test commit with bad message — should be blocked
- [ ] **Verify**: Make a commit with `:sparkles: feat(test): valid commit` — should pass

### Phase 4: CI Pipeline

- [ ] **Replace `.github/workflows/ci.yml`**: Copy from Section 3
- [ ] **Replace `.github/workflows/release.yml`**: Copy from Section 10
- [ ] **Create `.github/workflows/pr-triage.yml`**: Copy from Section 11
- [ ] **Create `.github/labeler.yml`**: Copy from Section 11
- [ ] **Update `sonar-project.properties`**: Copy from Section 7
- [ ] **Configure GitHub Secrets**: `SONAR_TOKEN`, `SONAR_HOST_URL`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
- [ ] **Verify**: Open a PR — all 6 CI jobs should run

### Phase 5: AI Review & Branch Protection

- [ ] **Create `.coderabbit.yaml`**: Copy from Section 12
- [ ] **Configure branch protection**: Settings → Branches (Section 15)
- [ ] **Verify**: CodeRabbit reviews the next PR automatically

### Phase 6: Lighthouse (Optional)

- [ ] **Install**: `pnpm add -D @lhci/cli`
- [ ] **Create `lighthouserc.js`**: Copy from Section 14
- [ ] **Add CI job**: Copy lighthouse job from Section 14
- [ ] **Verify**: Lighthouse report appears in CI

---

## 17. Maintenance & Governance

### Regular Tasks

| Task | Frequency | Command |
|---|---|---|
| Biome version update | Monthly | `pnpm update @biomejs/biome` |
| Dependency audit | Weekly | `pnpm audit --audit-level moderate` |
| Dead dependency scan | Monthly | `pnpm exec knip` (after installing) |
| Gitleaks baseline | On new false positive | Add to `.gitleaks.toml` allowlist |
| SonarQube review | Bi-weekly | Review dashboard for new code smells |
| Lighthouse thresholds | Quarterly | Adjust based on performance trends |

### Updating the Quality Pipeline

When adding a new quality tool:

1. **Local first**: Test the tool locally with `pnpm run <tool>`
2. **Pre-commit**: Add fast checks to `.husky/pre-commit`
3. **CI**: Add as a job or step in `.github/workflows/ci.yml`
4. **Document**: Add to this manual with success criteria
5. **Verify**: Open a test PR and confirm the check runs

### When Quality Checks Fail in CI

1. **Type errors**: `pnpm run type-check` locally, fix errors
2. **Biome failures**: `pnpm run biome:fix` to auto-fix
3. **Secret scan**: Review the flagged content — if false positive, add to `.gitleaks.toml` allowlist with documentation
4. **Build failure**: Run `pnpm run build` locally, fix errors
5. **Commit lint**: Amend the commit message to match `:emoji: type(scope): description`
6. **Test failure**: Run `pnpm run test` locally, fix failing tests

### Audit Trail

All quality gate decisions are traceable through:
- **GitHub Actions**: CI run history with logs
- **SonarQube**: Historical quality metrics dashboard
- **CodeRabbit**: PR review history
- **Git tags**: Release version history
- **PR labels**: Risk and size assessment per PR

---

## Appendix: SGS_WEB Quality Mechanisms Not Applicable to rc-apple-abyss

| Mechanism | Why Not Applicable | Alternative |
|---|---|---|
| `lint-duplicate-v-model.sh` | Vue-specific (v-model binding) | React doesn't have v-model |
| `validate-listar-pattern.sh` | Vue-specific store pattern | Not applicable |
| Turborepo | SGS_WEB uses monorepo features | Single-package repo; npm scripts suffice |
| Sentry source map upload | SGS_WEB has Sentry integration | Add when Sentry is configured |
| `validate-package-scripts.ts` | Supply-chain security for lifecycle hooks | Can be added if security concern increases |
| DaisyUI theming | Vue-specific component library | TailwindCSS v4 `dark:` variants used |
| `generate-tailwind-safelist.ts` | Vue-specific safelist generation | Next.js handles classes differently |
| `contrast-check.py` | SGS_WEB custom script | Lighthouse accessibility audit covers this |

---

*This manual is a living document. Update it when quality tools are added, removed, or configuration changes.*
