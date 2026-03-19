# Estrutura do Projeto - Apple of the Infinite Abyss

## Visao Geral

Aplicacao AI Studio com Gemini API desenvolvida em Next.js 15.

## Diretorios

```
apple-of-the-infinite-abyss/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Pagina principal
│   └── globals.css         # Estilos globais
├── components/             # Componentes React
│   └── ui/                 # Componentes UI reutilizaveis
├── hooks/                  # Custom Hooks React
├── lib/                    # Utilitarios e helpers
│   └── utils.ts            # Funcoes utilitarias
├── docs/                   # Documentacao
│   └── github-workflow/    # Padroes GitHub
├── .github/                # Templates e CI/CD
│   ├── ISSUE_TEMPLATE/     # Templates de issues
│   └── workflows/          # GitHub Actions
└── public/                 # Arquivos estaticos
```

## Convencoes

### Nomenclatura
- Componentes: PascalCase (Button.tsx)
- Hooks: camelCase com prefixo use (useGemini.ts)
- Utilitarios: camelCase (formatDate.ts)

### Imports
```typescript
// Ordem de imports
import React from 'react'           // 1. React
import { useRouter } from 'next/navigation'  // 2. Next.js
import { Button } from '@/components/ui'     // 3. Componentes locais
import { formatDate } from '@/lib/utils'     // 4. Utilitarios
```

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 |
| UI | React 19 |
| Estilos | TailwindCSS v4 |
| Linguagem | TypeScript |
| AI | Gemini API |
