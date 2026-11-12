[![CI](https://github.com/ricardo-camilo-programador-frontend-web/rc-apple-abyss/actions/workflows/ci.yml/badge.svg)](https://github.com/ricardo-camilo-programador-frontend-web/rc-apple-abyss/actions)
[![Deploy](https://img.shields.io/badge/deploy-netlify-00C7B7?logo=netlify)](https://click-on-the-malus-domestica-ide.netlify.app/)

# Apple of the Infinite Abyss

<div align="center">

**A minimalist incremental idle game where you eat apples with help of worms.**

[Live Demo](https://click-on-the-malus-domestica-ide.netlify.app/)

</div>

---

## Overview

Apple of the Infinite Abyss is an idle/incremental game built with Next.js where the core mechanic revolves around eating apples with the help of worms. The game features persistent progression, upgrade systems, skill activation, onboarding, goal tracking, daily rewards, and multiple apple varieties.

## Tech Stack

- **Next.js 15** — App Router, SSR/SSG
- **React 19** — UI Library
- **TypeScript 5** — Type Safety
- **TailwindCSS 4** — Styling
- **Gemini API** — AI-generated content (apple descriptions, lore)

## Features

- **Idle Gameplay** — Progress continues even when you are away
- **Apple Varieties** — Discover and collect different apple types
- **Worm Helpers** — Recruit worms to boost your apple consumption
- **Upgrade System** — Spend resources on permanent upgrades
- **Skill System** — Activate Golden Harvest for temporary bonuses
- **Journey System** — Track goals, earn daily rewards, follow an onboarding tutorial
- **Onboarding** — 3-step guided tutorial for new players
- **Daily Rewards** — Streak-based gold bonus (1–7 day cycle)
- **Goal Tracking** — 22 progressive objectives with gold/worm rewards
- **Save Migration** — Backward-compatible saves; old data gracefully upgraded
- **Localization** — 20 languages with English fallback
- **AI Content** — Gemini-powered descriptions and lore
- **Error Handling** — Robust error boundaries with recovery UI
- **Toast Notifications** — User-friendly feedback system

## Project Structure

```
rc-apple-abyss/
├── app/                    # Next.js App Router
│   ├── apple-varieties/    # Apple varieties catalog
│   ├── privacy/            # Privacy policy
│   └── terms/              # Terms of service
├── components/             # React components
│   ├── Game.tsx            # Core game component
│   ├── game/               # Extracted game components
│   │   ├── GameHeader.tsx  # Top bar (gold, stage, worms, journey nav)
│   │   ├── AppleArea.tsx   # Main click target area
│   │   ├── UpgradeSidebar.tsx
│   │   ├── AscensionSidebar.tsx
│   │   ├── MobileNav.tsx   # Bottom navigation bar
│   │   ├── GameFooter.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── SkillsModal.tsx
│   │   ├── StatsModal.tsx
│   │   ├── OfflineModal.tsx
│   │   ├── OnboardingModal.tsx   # 3-step onboarding
│   │   └── JourneyModal.tsx      # Goals + daily reward
│   ├── ErrorBoundary.tsx
│   └── Toast.tsx
├── hooks/                  # Custom hooks
│   ├── use-game-loop.ts
│   └── use-game-keyboard.ts
├── lib/                    # Core logic
│   ├── game/
│   │   ├── types.ts        # All TypeScript interfaces
│   │   ├── constants.ts    # Game config, localization, initial state
│   │   ├── engine.ts       # Game engine (state machine, save/load)
│   │   ├── goals.ts        # Pure goal rules (catalog, progress)
│   │   ├── daily-reward.ts # Pure daily reward rules (streak, gold)
│   │   ├── localization.ts
│   │   ├── skills.ts
│   │   ├── audio.ts
│   │   └── offline.ts
│   ├── analytics.ts        # Event tracking (Clarity, custom events)
│   └── ads/                # Ad integration
├── tests/                  # Vitest test suites
│   ├── engine.test.ts      # Core engine tests
│   ├── goals.test.ts       # Goal rule tests
│   └── daily-reward.test.ts # Daily reward rule tests
├── docs/                   # Documentation
└── .github/                # CI/CD workflows
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/ricardo-camilo-programador-frontend-web/rc-apple-abyss.git

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Add GEMINI_API_KEY in .env.local

# Start development server
pnpm dev
```

## Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint
pnpm test      # Run Vitest test suite
pnpm type-check # TypeScript type checking
```

## Advertising

The apple varieties guide can show **one** labeled Adsterra slot at the end of the article (native banner, or a display banner). Pop-unders, social bars, smartlinks, and interstitials are not used. The game screen keeps its existing AdSense unit and does not load Adsterra.

Nothing is injected unless all of these are true:

- the zone key for that format is set
- `NEXT_PUBLIC_ADSTERRA_ENABLED` is not `false` (empty means on only when a key exists)
- the build is production
- `window.location.hostname` is the canonical host (`https://click-on-the-malus-domestica-ide.netlify.app`, or `NEXT_PUBLIC_SITE_URL` when set)
- the study-project modal has not turned analytics off

That modal's analytics toggle also updates Google `ad_storage`. `AdsterraBanner` checks `window.rcStudyModal.isAnalyticsEnabled()` when the function exists and listens for `rc-study-modal:analytics`. A missing API does not block the ad, because the modal defaults analytics to on. The modal's ads sentence is informational; it does not change the toggle or the `rc-study-modal` localStorage key.

Copy the Native Banner values from the Adsterra panel: **Websites → your site → Get Code**. `NEXT_PUBLIC_ADSTERRA_NATIVE_HOST` is the host in that script URL (for example `plXXXX.effectivegatecpm.com`). Set the variables in Netlify under **Site configuration → Environment variables**, then redeploy. `public/ads.txt` keeps the Google line. After Adsterra approves the site, paste their official ads.txt line from the panel. Do not invent a publisher id.

| Variable | Role |
| --- | --- |
| `NEXT_PUBLIC_ADSTERRA_NATIVE_KEY` | Native Banner zone key. Empty = no ad. |
| `NEXT_PUBLIC_ADSTERRA_NATIVE_HOST` | Script host from Get Code. Required for the native slot. |
| `NEXT_PUBLIC_ADSTERRA_BANNER_KEY` | Optional display banner key. |
| `NEXT_PUBLIC_ADSTERRA_BANNER_HOST` | Optional. Defaults to `www.highperformanceformat.com`. |
| `NEXT_PUBLIC_ADSTERRA_ENABLED` | `false` forces the slot off. |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical origin. Preview deploys must not match it. |

## Journey System Architecture

### Goals (Pure Rules)
Goals are defined in `lib/game/goals.ts` as pure functions — no side effects, no engine dependency. The `GOAL_DEFINITIONS` catalog lists 22 goals across 5 categories (milestone, upgrade, ascension, collection, skill). Progress is always derived from `GameState` directly, never stored as counters.

### Daily Reward (Pure Rules)
Daily reward logic in `lib/game/daily-reward.ts` is fully pure. Streak calculation, eligibility, gold amounts, and timestamp validation are all pure functions. The engine layer handles state mutation and persistence.

### Save Migration
Old saves without the `journey` field are automatically migrated. `mergeJourneyState()` in the engine provides default initial state for missing journey data. Corrupted values are sanitized gracefully.

## Author

**Ricardo Camilo**
- GitHub: [@ricardo-camilo-programador-frontend-web](https://github.com/ricardo-camilo-programador-frontend-web)
- Portfolio: [rc-portfolio](https://persona-nextjs-chronicles-part-2.netlify.app/)

## License

MIT License
