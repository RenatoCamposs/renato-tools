# PRD - Infinite Board App

## 📋 Visão Geral

Uma aplicação web de board infinito estilo Miro, com cards interativos que possuem efeitos visuais suaves ao hover/interação (inspirado em Obsidian), sistema de autenticação simples, e design system baseado em cores amareladas pastel.

---

## 🎯 Objetivos

### Objetivo Principal
Criar um espaço de trabalho visual infinito onde usuários podem organizar ideias através de cards movíveis com interface moderna e fluida.

### Objetivos Secundários
- Interface intuitiva e responsiva
- Performance suave mesmo com muitos cards
- Autenticação rápida e segura
- Design system consistente e profissional
- Deploy automatizado

---

## 👥 Público-Alvo

- Profissionais que precisam organizar ideias visualmente
- Estudantes criando mapas mentais
- Equipes fazendo brainstorming
- Qualquer pessoa que prefere organização visual

---

## ✨ Features & Requisitos

### 🔐 Autenticação (P0 - Crítico)

**Requisitos:**
- Login simples sem banco de dados
- JWT tokens criptografados
- Session management seguro
- Proteção de rotas
- Auto-logout após inatividade

**Solução Técnica:**
- **Clerk** como provedor de autenticação
  - Sign-in/Sign-up pronto
  - JWT management automático
  - Middleware de proteção
  - UI components integrados
  - Zero configuração de DB

**Fluxo:**
```
1. Usuário acessa app
2. Redireciona para /sign-in (Clerk UI)
3. Login com email/senha ou OAuth
4. JWT token armazenado (httpOnly cookie)
5. Acesso ao board
6. Token validado em cada request
7. Auto-refresh de token
```

**Segurança:**
- HTTPS obrigatório
- CSRF protection
- Rate limiting no middleware
- XSS protection
- Token expiration (1 hora)
- Refresh token (7 dias)

---

### 🖼️ Canvas Infinito (P0 - Crítico)

**Requisitos:**
- Pan (arrastar canvas) com mouse/touch
- Zoom (scroll wheel / pinch)
- Navegação suave (60 FPS)
- Minimap para navegação rápida
- Reset view button
- Performance com 1000+ cards

**Interações:**
- **Pan:** Click + drag no background
- **Zoom:** Scroll wheel (ctrl+scroll para zoom mais rápido)
- **Mobile:** Touch gestures (pinch to zoom)
- **Keyboard:** Espaço + drag = pan

**Limites:**
- Zoom: 0.1x até 3x
- Canvas virtual: ilimitado
- Render visible area + buffer zone

---

### 🎴 Cards (P0 - Crítico)

#### **Tipos de Cards:**

1. **Card Padrão (ContentCard)**
   - Imagem/ícone quadrado (64x64px)
   - Título (1 linha, truncated)
   - Descrição (2-3 linhas, truncated)
   - Tamanho: 200x140px (compacto)

2. **Card Pasta (FolderCard)** 
   - Visual similar ao ContentCard
   - Ícone de pasta
   - Badge com contador de itens
   - Ao clicar: expande mostrando cards filhos
   - Efeito "burst" - cards saem da pasta animados

**Requisitos Funcionais:**
- Criar card (double-click no canvas)
- Deletar card (botão ou tecla Delete)
- Editar card (modal ou inline)
- Mover card (drag and drop)
- Criar pasta (opção no menu)
- Adicionar card à pasta (drag into folder)
- Expandir/colapsar pasta (click)
- Auto-organização em nuvem/grafo

**Propriedades do Card:**
```typescript
interface BaseCard {
  id: string;
  type: 'content' | 'folder';
  position: { x: number; y: number };
  title: string;
  description: string;
  image: string; // URL ou emoji/icon
  color: string;
  parentId?: string; // Se está dentro de uma pasta
  createdAt: Date;
  updatedAt: Date;
}

interface ContentCard extends BaseCard {
  type: 'content';
  tags?: string[];
  links?: string[]; // IDs de cards conectados
}

interface FolderCard extends BaseCard {
  type: 'folder';
  children: string[]; // IDs dos cards filhos
  isExpanded: boolean;
  layoutStyle: 'circle' | 'grid' | 'burst'; // Como organizar filhos
}
```

**Estados do Card:**
- **Idle:** Estado padrão
- **Hover:** Efeitos visuais ativados (glow, lift)
- **Selected:** Borda destacada
- **Editing:** Modo de edição
- **Dragging:** Sendo arrastado
- **Expanded:** (Apenas FolderCard) Mostrando filhos
- **Collapsed:** (Apenas FolderCard) Filhos ocultos

**Persistência:**
- Auto-save a cada 2 segundos (debounced)
- Save on blur (quando sair do card)
- LocalStorage como fallback
- Sincronização via Supabase (sem auth, apenas storage)

---

### ✨ Efeitos Visuais (P0 - Crítico)

**Inspiração:** Obsidian Graph View + Material Design + Glass morphism

#### **Efeito de Nuvem (Cloud/Graph Layout)**

**Comportamento:**
- Cards flutuam suavemente (física sutil)
- Conexões visuais entre cards relacionados
- Organização automática tipo force-directed graph
- Evita sobreposição de cards
- Aproxima cards relacionados

**Implementação:**
- D3-force ou react-force-graph para física
- Animação contínua suave (não estática)
- Amortecimento para estabilizar
- Zoom to fit quando necessário

#### **Efeitos no Card Padrão:**

**Hover:**
1. **Glow suave** (box-shadow amarelo pastel)
2. **Lift effect** (translateY: -8px + scale: 1.05)
3. **Border shimmer** (gradient animado)
4. **Backdrop blur** aumentado
5. **Conexões destacadas** (se houver)

**Drag:**
1. **Shadow forte** (elevação z-index 999)
2. **Slight tilt** (rotate baseado na velocidade)
3. **Magnetic snap** ao aproximar de pasta
4. **Trail particles** (opcional P1)

#### **Efeitos de Pasta (FolderCard)**

**Expansão (onClick):**
```
1. Card pasta pulsa (scale: 1.1)
2. Burst animation - cards filhos "explodem" da pasta
3. Cada filho aparece em sequência (stagger 50ms)
4. Filhos se posicionam em círculo/grid ao redor da pasta
5. Linhas conectam pasta → filhos (animadas)
6. Background da pasta fica levemente transparente
```

**Colapso:**
```
1. Filhos voltam para a posição da pasta (reverse animation)
2. Scale down + fade out
3. Pasta volta ao estado normal (scale: 1)
4. Conexões desaparecem suavemente
```

**Animação de Burst (Snappy):**
```typescript
const burstAnimation = {
  initial: { 
    scale: 0, 
    opacity: 0,
    x: 0, 
    y: 0 
  },
  animate: (index: number) => ({
    scale: 1,
    opacity: 1,
    x: Math.cos(index * (Math.PI * 2 / total)) * radius,
    y: Math.sin(index * (Math.PI * 2 / total)) * radius,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: index * 0.05
    }
  })
}
```

**Layout dos Filhos:**

1. **Circle Layout** (padrão)
   - Cards em círculo ao redor da pasta
   - Raio: 300-400px
   - Distribuição uniforme

2. **Grid Layout**
   - Grid 3x3 ou 4x4
   - Espaçamento fixo
   - Organizado e limpo

3. **Burst Layout**
   - Posições aleatórias controladas
   - Mais orgânico
   - Evita sobreposição

#### **Conexões Visuais (Links entre Cards)**

**Estilo:**
- Linhas curvas (bezier)
- Cor: `var(--primary-300)` com opacity 0.4
- Espessura: 2px
- Animação de "drawing" ao aparecer
- Glow no hover

**Tipos de Conexão:**
- **Pasta → Filhos:** Linha sólida
- **Card → Card:** Linha tracejada
- **Hover:** Destaca conexões do card

**Transições:**
- Duração: 200-400ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- GPU accelerated (transform, opacity)
- Spring physics para movimento natural

**Performance:**
- `will-change` apenas durante animação
- Throttle de física do grafo
- RequestAnimationFrame para smoothness
- Virtualização se > 200 cards

---

### 🎨 Design System (P0 - Crítico)

#### Cores (Amarelo Pastel Light Mode)

**Paleta Principal:**
```css
/* Amarelos Pastel */
--primary-50: #FFFEF5;   /* Background mais claro */
--primary-100: #FFFAEB;  /* Background cards */
--primary-200: #FFF4D1;  /* Hover states */
--primary-300: #FFEDB8;  /* Borders */
--primary-400: #FFE49E;  /* Active states */
--primary-500: #FFD978;  /* Primary actions */
--primary-600: #F5C452;  /* Primary hover */
--primary-700: #E6AE3A;  /* Text primary */
--primary-800: #CC9530;  /* Text strong */
--primary-900: #A87828;  /* Text strongest */

/* Neutros Quentes */
--neutral-50: #FDFCF9;   /* Canvas background */
--neutral-100: #F7F5F0;  /* Card background */
--neutral-200: #EBE8DF;  /* Borders */
--neutral-300: #D6D1C4;  /* Disabled */
--neutral-400: #B8B0A0;  /* Placeholder */
--neutral-500: #8C8474;  /* Text secondary */
--neutral-600: #6B6355;  /* Text primary */
--neutral-700: #4A4239;  /* Text strong */
--neutral-800: #2E2822;  /* Text strongest */
--neutral-900: #1A1510;  /* Text black */

/* Acentos */
--accent-peach: #FFE8D1;    /* Info states */
--accent-cream: #FFF9ED;    /* Success states */
--accent-honey: #FFEBBA;    /* Warning states */
--accent-coral: #FFD4BD;    /* Error states (suave) */

/* Funcionais */
--success: #D4E8B8;    /* Verde pastel */
--error: #FFD4BD;      /* Coral suave */
--warning: #FFEBBA;    /* Honey */
--info: #D1E8FF;       /* Azul pastel */

/* Sombras e Efeitos */
--shadow-sm: 0 1px 2px rgba(168, 120, 40, 0.05);
--shadow-md: 0 4px 6px rgba(168, 120, 40, 0.08);
--shadow-lg: 0 10px 20px rgba(168, 120, 40, 0.12);
--shadow-xl: 0 20px 40px rgba(168, 120, 40, 0.15);

--glow-primary: 0 0 20px rgba(255, 217, 120, 0.4);
--glow-hover: 0 0 30px rgba(255, 217, 120, 0.6);
```

#### Tipografia

```css
/* Fontes */
--font-sans: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Tamanhos */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Pesos */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### Espaçamento

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

#### Bordas & Raios

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;

--border-width: 1px;
--border-width-2: 2px;
--border-width-4: 4px;
```

#### Animações

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--transition-slower: 500ms;

--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

### 💾 Persistência (P0 - Crítico)

**Estratégia Híbrida:**

1. **LocalStorage (Primário)**
   - Salva todas as alterações localmente
   - Recupera na próxima sessão
   - Não requer autenticação

2. **Supabase Storage (Backup - Opcional)**
   - Sincroniza boards via API pública
   - Sem autenticação (apenas storage)
   - Gera link compartilhável (P1)

**Estrutura de Dados:**
```typescript
interface BoardData {
  id: string;
  name: string;
  cards: Card[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  lastModified: Date;
}
```

**Auto-save:**
- Debounced (2 segundos)
- Salva no localStorage
- Feedback visual (salvando... / salvo)

---

## 🏗️ Arquitetura Técnica

### Stack

```yaml
Frontend:
  - Next.js 15 (App Router)
  - TypeScript
  - React 19
  - Tailwind CSS

Canvas & Graph:
  - React Flow (canvas engine base)
  - @xyflow/react
  - d3-force (physics para nuvem)
  - react-force-graph-2d (alternativa)

Animações:
  - Framer Motion
  
Autenticação:
  - Clerk

State Management:
  - Zustand (para canvas state)
  - React Context (para user/auth)

Storage:
  - LocalStorage (primário)
  - Supabase Storage (opcional)

Deploy:
  - Vercel
  - GitHub

Tools:
  - ESLint + Prettier
  - TypeScript strict mode
  - Husky (pre-commit hooks)
```

### Estrutura de Pastas

```
infinite-board-app/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── board/
│   │   └── page.tsx                    # Main board page
│   ├── layout.tsx
│   └── page.tsx                        # Landing page
├── components/
│   ├── board/
│   │   ├── Canvas.tsx
│   │   ├── Card.tsx
│   │   ├── Minimap.tsx
│   │   └── Toolbar.tsx
│   ├── design-system/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Tooltip.tsx
│   └── providers/
│       ├── AuthProvider.tsx
│       └── ThemeProvider.tsx
├── lib/
│   ├── stores/
│   │   └── boardStore.ts              # Zustand store
│   ├── utils/
│   │   ├── cn.ts                      # classnames utility
│   │   └── storage.ts                 # LocalStorage wrapper
│   └── types/
│       └── index.ts
├── styles/
│   ├── globals.css
│   └── design-tokens.css
├── public/
├── docs/
│   ├── PRD.md
│   ├── COMPONENT-SPECS.md
│   └── DEPLOYMENT.md
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Fases de Desenvolvimento

### Fase 0: Setup (P0)
- [x] Criar estrutura de projeto
- [ ] Configurar Next.js + TypeScript
- [ ] Setup Tailwind + Design Tokens
- [ ] Configurar Clerk
- [ ] Setup Git + GitHub
- [ ] Deploy inicial na Vercel

### Fase 1: MVP Core (P0)
- [ ] Canvas infinito básico (React Flow)
- [ ] ContentCard (imagem + título + descrição)
- [ ] FolderCard (pasta com filhos)
- [ ] Criar/deletar cards
- [ ] Arrastar cards
- [ ] Efeito de nuvem básico (força física)
- [ ] Salvar no localStorage
- [ ] Design system base (Button, Card)
- [ ] Autenticação com Clerk

### Fase 2: Efeitos Visuais (P0)
- [ ] Hover effects nos cards (glow, lift)
- [ ] Drag effects (tilt, shadow)
- [ ] Animação de burst (expandir pasta)
- [ ] Conexões visuais entre cards
- [ ] Transições suaves
- [ ] Glow e shadows
- [ ] Física de nuvem refinada

### Fase 3: Polish (P1)
- [ ] Minimap
- [ ] Toolbar (criar, deletar, zoom controls)
- [ ] Keyboard shortcuts
- [ ] Undo/Redo
- [ ] Export board (JSON)
- [ ] Dark mode toggle (P2)

### Fase 4: Features Avançadas (P2)
- [ ] Conectar cards (edges)
- [ ] Múltiplos boards
- [ ] Compartilhamento via link
- [ ] Colaboração real-time (P3)
- [ ] Templates de cards

---

## 📊 Métricas de Sucesso

### Performance
- First Contentful Paint < 1s
- Time to Interactive < 2s
- 60 FPS durante interações
- Suporta 1000+ cards sem lag

### UX
- Tempo médio para criar primeiro card < 10s
- Taxa de conclusão de onboarding > 80%
- NPS > 8/10

### Técnico
- Lighthouse Score > 90
- Zero erros de console em produção
- Cobertura de testes > 70% (P2)

---

## 🔒 Considerações de Segurança

### Autenticação
- [x] JWT tokens criptografados (Clerk)
- [x] HTTPS obrigatório
- [x] Rate limiting
- [x] CSRF protection (Next.js built-in)
- [ ] XSS sanitization (para conteúdo dos cards)

### Data
- [ ] Input validation (zod)
- [ ] Sanitize HTML/markdown
- [ ] Limite de tamanho de cards (10KB por card)
- [ ] Limite de quantidade (1000 cards por board)

### Privacy
- [ ] Dados armazenados localmente primeiro
- [ ] Opt-in para sync com cloud
- [ ] Clear data option

---

## 🎨 Referências de Design

### Inspirações
- **Miro:** Canvas infinito, pan/zoom
- **Obsidian:** Efeitos visuais suaves, glass morphism
- **Linear:** Animações snappy, performance
- **Notion:** Simplicidade, UX intuitiva

### Mood Board
- Cores: Pastel yellow/cream/warm neutrals
- Estilo: Modern, clean, minimal
- Animações: Subtle, smooth, professional
- Layout: Spacious, organized, clear hierarchy

---

## 📝 Notas de Implementação

### Prioridades
1. **Performance first:** 60 FPS é obrigatório
2. **Simplicidade:** UI intuitiva sem tutorial
3. **Progressivo:** Funciona offline-first
4. **Acessibilidade:** Keyboard navigation (P1)

### Decisões Técnicas

**Por que React Flow?**
- Performático (virtualização)
- Pan/zoom built-in
- Extensível
- Manutenido ativamente

**Por que Clerk?**
- Zero config de DB
- UI pronta
- Seguro por padrão
- Grátis até 10k users

**Por que LocalStorage?**
- Funciona offline
- Zero latência
- Simples
- Privacidade

**Por que Framer Motion?**
- Declarativo
- Performance
- Gestures built-in
- TypeScript support

---

## 🔄 Roadmap Futuro

### v1.0 (MVP) - 1-2 semanas
- Canvas + Cards básicos
- Auth com Clerk
- Efeitos visuais
- LocalStorage

### v1.1 - 2-3 semanas
- Minimap
- Toolbar completo
- Keyboard shortcuts
- Export/Import

### v2.0 - 1-2 meses
- Múltiplos boards
- Compartilhamento
- Conectar cards
- Templates

### v3.0 - 3+ meses
- Real-time collaboration
- Mobile app
- Plugins system
- AI features

---

## 📞 Contato & Suporte

**Desenvolvedor:** Renato
**Repositório:** GitHub (a ser criado)
**Deploy:** Vercel
**Status:** Em desenvolvimento

---

*Última atualização: 13 de Fevereiro de 2026*
