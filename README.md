[![CI](https://github.com/ricardo-camilo-programador-frontend-web/rc-apple-abyss/actions/workflows/ci.yml/badge.svg)](https://github.com/ricardo-camilo-programador-frontend-web/rc-apple-abyss/actions)
[![Deploy](https://img.shields.io/badge/deploy-netlify-00C7B7?logo=netlify)](https://click-on-the-malus-domestica-ide.netlify.app/)

# Apple of the Infinite Abyss

<div align="center">

**A minimalist incremental idle game where you eat apples with help of worms.**

[Live Demo](https://click-on-the-malus-domestica-ide.netlify.app/)

</div>

---

## Overview

Apple of the Infinite Abyss is an idle/incremental game built with Next.js where the core mechanic revolves around eating apples with the help of worms. The game features persistent progression, upgrade systems, and multiple apple varieties.

## Tech Stack

- **Next.js 15** — App Router, SSR/SSG
- **React 19** — UI Library
- **TypeScript 5** — Type Safety
- **TailwindCSS 4** — Styling
- **Gemini API** — AI-generated content (apple descriptions, lore)

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

## Project Structure

```
rc-apple-abyss/
├── app/                    # Next.js App Router
│   ├── apple-varieties/    # Apple varieties catalog
│   ├── privacy/            # Privacy policy
│   └── terms/              # Terms of service
├── components/             # React components
│   ├── Game.tsx            # Core game component
│   ├── ErrorBoundary.tsx   # Error handling boundary
│   └── Toast.tsx           # Notification system
├── hooks/                  # Custom hooks
│   └── use-retry.ts        # Retry logic with exponential backoff
├── lib/                    # Utilities
├── docs/                   # Documentation
└── .github/                # CI/CD workflows
```

## Features

- **Idle Gameplay** — Progress continues even when you are away
- **Apple Varieties** — Discover and collect different apple types
- **Worm Helpers** — Recruit worms to boost your apple consumption
- **Upgrade System** — Spend resources on permanent upgrades
- **AI Content** — Gemini-powered descriptions and lore
- **Error Handling** — Robust error boundaries with recovery UI
- **Toast Notifications** — User-friendly feedback system

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Author

**Ricardo Camilo**
- GitHub: [@ricardo-camilo-programador-frontend-web](https://github.com/ricardo-camilo-programador-frontend-web)
- Portfolio: [rc-portfolio](https://persona-nextjs-chronicles-part-2.netlify.app/)

## License

MIT License
