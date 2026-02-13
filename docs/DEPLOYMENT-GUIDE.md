# Deployment Guide - Infinite Board App

## 🚀 Guia de Deploy Completo

Este documento contém todas as instruções para fazer deploy da aplicação.

---

## Pré-requisitos

### 1. Contas Necessárias

- ✅ **GitHub Account** (para hospedagem do código)
- ✅ **Vercel Account** (para deploy)
- ✅ **Clerk Account** (para autenticação)

### 2. Ferramentas Instaladas

```bash
node --version  # >= 18.x
npm --version   # >= 9.x
git --version   # >= 2.x
```

---

## 📦 Setup Inicial do Projeto

### 1. Criar Projeto Next.js

```bash
cd C:\Users\Renato\Documents\Cursor\infinite-board-app

# Criar projeto Next.js 15 com App Router
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Responder as perguntas:**
- TypeScript? **Yes**
- ESLint? **Yes**
- Tailwind CSS? **Yes**
- App Router? **Yes**
- Customize import alias? **No** (usa @ por padrão)

### 2. Instalar Dependências

```bash
# Canvas e Grafo
npm install @xyflow/react d3-force

# Animações
npm install framer-motion

# State Management
npm install zustand

# Autenticação
npm install @clerk/nextjs

# Utilities
npm install clsx tailwind-merge class-variance-authority

# Icons
npm install lucide-react

# Dev Dependencies
npm install -D @types/d3-force
```

---

## 🎨 Configurar Design System

### 1. Criar Tokens CSS

**Arquivo:** `styles/design-tokens.css`

```css
:root {
  /* Amarelos Pastel */
  --primary-50: #FFFEF5;
  --primary-100: #FFFAEB;
  --primary-200: #FFF4D1;
  --primary-300: #FFEDB8;
  --primary-400: #FFE49E;
  --primary-500: #FFD978;
  --primary-600: #F5C452;
  --primary-700: #E6AE3A;
  --primary-800: #CC9530;
  --primary-900: #A87828;
  
  /* Neutros Quentes */
  --neutral-50: #FDFCF9;
  --neutral-100: #F7F5F0;
  --neutral-200: #EBE8DF;
  --neutral-300: #D6D1C4;
  --neutral-400: #B8B0A0;
  --neutral-500: #8C8474;
  --neutral-600: #6B6355;
  --neutral-700: #4A4239;
  --neutral-800: #2E2822;
  --neutral-900: #1A1510;
  
  /* Acentos */
  --accent-peach: #FFE8D1;
  --accent-cream: #FFF9ED;
  --accent-honey: #FFEBBA;
  --accent-coral: #FFD4BD;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(168, 120, 40, 0.05);
  --shadow-md: 0 4px 6px rgba(168, 120, 40, 0.08);
  --shadow-lg: 0 10px 20px rgba(168, 120, 40, 0.12);
  --shadow-xl: 0 20px 40px rgba(168, 120, 40, 0.15);
  
  --glow-primary: 0 0 20px rgba(255, 217, 120, 0.4);
  --glow-hover: 0 0 30px rgba(255, 217, 120, 0.6);
  
  /* Espaçamento */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  
  /* Bordas */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Transições */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
  --transition-slower: 500ms;
  
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2. Atualizar Tailwind Config

**Arquivo:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
        },
        accent: {
          peach: 'var(--accent-peach)',
          cream: 'var(--accent-cream)',
          honey: 'var(--accent-honey)',
          coral: 'var(--accent-coral)',
        }
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow': 'var(--glow-primary)',
        'glow-hover': 'var(--glow-hover)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'base': 'var(--transition-base)',
        'slow': 'var(--transition-slow)',
        'slower': 'var(--transition-slower)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 🔐 Configurar Clerk (Autenticação)

### 1. Criar Conta no Clerk

1. Acesse: https://clerk.com
2. Sign up grátis
3. Criar nova aplicação: "Infinite Board App"
4. Escolher providers: Email/Password + Google (opcional)

### 2. Obter API Keys

No dashboard do Clerk:
- Copiar `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Copiar `CLERK_SECRET_KEY`

### 3. Criar `.env.local`

```bash
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/board
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/board
```

### 4. Configurar Middleware

**Arquivo:** `middleware.ts`

```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/'],
  ignoredRoutes: ['/api/public']
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 5. Criar Layout com Clerk

**Arquivo:** `app/layout.tsx`

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import '../styles/design-tokens.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 📂 Setup Git & GitHub

### 1. Inicializar Git

```bash
cd C:\Users\Renato\Documents\Cursor\infinite-board-app

git init
git add .
git commit -m "Initial commit: Infinite Board App"
```

### 2. Criar `.gitignore`

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/
dist/

# Env
.env
.env.local
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
.nyc_output/
```

### 3. Criar Repositório no GitHub

**Via GitHub CLI:**
```bash
gh repo create infinite-board-app --public --source=. --remote=origin
git push -u origin main
```

**Ou manualmente:**
1. Acessar https://github.com/new
2. Nome: `infinite-board-app`
3. Public
4. Criar repository
5. Seguir instruções para push

```bash
git remote add origin https://github.com/SEU_USERNAME/infinite-board-app.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy na Vercel

### Método 1: Via Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir prompts:
# - Set up and deploy? Yes
# - Scope: Sua conta
# - Link to existing project? No
# - Project name: infinite-board-app
# - Directory: ./
# - Override settings? No

# Deploy para produção
vercel --prod
```

### Método 2: Via Dashboard Vercel

1. Acessar https://vercel.com
2. Sign up/Login (pode usar GitHub)
3. Clicar "Add New Project"
4. Importar de GitHub: `infinite-board-app`
5. Configurar:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Adicionar Environment Variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/board
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/board
   ```
7. Deploy!

### 3. Configurar Domínio (Opcional)

```bash
vercel domains add seudominio.com
```

Ou via dashboard:
1. Project Settings → Domains
2. Add domain
3. Seguir instruções de DNS

---

## 🔧 Configurações da Vercel

### vercel.json (Opcional)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
    "CLERK_SECRET_KEY": "@clerk-secret-key"
  }
}
```

### Headers & Redirects (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 🔄 CI/CD Automático

### GitHub Actions (Opcional)

**Arquivo:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📊 Monitoramento

### 1. Vercel Analytics

Adicionar em `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Monitoring (Opcional)

Integrar Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## ✅ Checklist Final

- [ ] Código commitado no Git
- [ ] Repositório criado no GitHub
- [ ] Push para GitHub realizado
- [ ] Conta Clerk criada
- [ ] API keys do Clerk configuradas
- [ ] Deploy na Vercel realizado
- [ ] Environment variables configuradas
- [ ] Teste de autenticação funcionando
- [ ] Domínio customizado (opcional)
- [ ] Analytics configurado (opcional)

---

## 🐛 Troubleshooting

### Erro: "Module not found"
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Erro: "Clerk keys not found"
- Verificar `.env.local` existe
- Verificar keys estão corretas
- Reiniciar dev server

### Erro: "Build failed on Vercel"
- Verificar env vars na Vercel
- Verificar `next.config.js` está correto
- Checar logs de build na Vercel

### Deploy não atualiza
```bash
vercel --force
```

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Clerk Docs:** https://clerk.com/docs

---

*Última atualização: 13 de Fevereiro de 2026*
