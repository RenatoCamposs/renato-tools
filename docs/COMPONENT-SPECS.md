# Component Specifications

Especificações técnicas detalhadas de todos os componentes do Infinite Board App.

---

## 📁 Estrutura de Componentes

```
components/
├── board/              # Componentes do canvas
│   ├── Canvas.tsx
│   ├── Card.tsx
│   ├── CardNode.tsx
│   ├── Minimap.tsx
│   ├── Toolbar.tsx
│   ├── ControlPanel.tsx
│   └── EmptyState.tsx
├── design-system/      # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Tooltip.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── IconButton.tsx
├── layout/             # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Container.tsx
└── providers/          # Context providers
    ├── AuthProvider.tsx
    ├── ThemeProvider.tsx
    └── BoardProvider.tsx
```

---

## 🎨 Design System Components

### 1. Button

**Arquivo:** `components/design-system/Button.tsx`

**Descrição:** Botão base do sistema com variantes e tamanhos.

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}
```

**Variantes:**

1. **Primary** (default)
   - Background: `var(--primary-500)`
   - Hover: `var(--primary-600)`
   - Text: `var(--neutral-900)`
   - Shadow: `var(--shadow-md)`
   - Glow on hover: `var(--glow-primary)`

2. **Secondary**
   - Background: `var(--neutral-100)`
   - Hover: `var(--neutral-200)`
   - Border: `var(--neutral-300)`
   - Text: `var(--neutral-700)`

3. **Ghost**
   - Background: transparent
   - Hover: `var(--neutral-100)`
   - Text: `var(--neutral-700)`

4. **Danger**
   - Background: `var(--accent-coral)`
   - Hover: darken 10%
   - Text: `var(--neutral-900)`

**Tamanhos:**
```css
/* sm */
padding: var(--spacing-2) var(--spacing-3);
font-size: var(--text-sm);
height: 32px;

/* md */
padding: var(--spacing-3) var(--spacing-4);
font-size: var(--text-base);
height: 40px;

/* lg */
padding: var(--spacing-4) var(--spacing-6);
font-size: var(--text-lg);
height: 48px;
```

**Estados:**
- Hover: lift + glow
- Active: scale(0.98)
- Disabled: opacity 0.5, cursor not-allowed
- Loading: spinner + disabled

**Animações:**
```typescript
const buttonVariants = {
  hover: {
    scale: 1.02,
    boxShadow: 'var(--glow-hover)',
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98
  }
}
```

**Exemplo de Uso:**
```tsx
<Button 
  variant="primary" 
  size="md"
  leftIcon={<PlusIcon />}
  onClick={handleCreate}
>
  Criar Card
</Button>
```

---

### 2. Input

**Arquivo:** `components/design-system/Input.tsx`

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}
```

**Estilos:**
```css
.input {
  background: var(--neutral-50);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--text-base);
  color: var(--neutral-800);
  transition: all var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(255, 217, 120, 0.1);
}

.input::placeholder {
  color: var(--neutral-400);
}

.input[aria-invalid="true"] {
  border-color: var(--accent-coral);
}
```

**Exemplo:**
```tsx
<Input
  label="Nome do Board"
  placeholder="Digite o nome..."
  error={errors.name}
  leftIcon={<BoardIcon />}
/>
```

---

### 3. Modal

**Arquivo:** `components/design-system/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}
```

**Estrutura:**
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div className="modal-overlay">
      <motion.div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <IconButton onClick={onClose} />
        </div>
        <div className="modal-body">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

**Animações:**
```typescript
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      duration: 0.3
    }
  }
}
```

**Estilos:**
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 37, 32, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--neutral-50);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--neutral-200);
  max-height: 90vh;
  overflow: auto;
}
```

---

### 4. Tooltip

**Arquivo:** `components/design-system/Tooltip.tsx`

**Props:**
```typescript
interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
```

**Estilos:**
```css
.tooltip {
  position: absolute;
  background: var(--neutral-900);
  color: var(--neutral-50);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  white-space: nowrap;
  box-shadow: var(--shadow-lg);
  z-index: 9999;
}

.tooltip::after {
  content: '';
  position: absolute;
  border: 6px solid transparent;
  /* Arrow based on placement */
}
```

---

## 🖼️ Board Components

### 5. Canvas

**Arquivo:** `components/board/Canvas.tsx`

**Descrição:** Componente principal que encapsula React Flow.

**Props:**
```typescript
interface CanvasProps {
  boardId: string;
}
```

**Implementação Base:**
```tsx
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState
} from '@xyflow/react';

export function Canvas({ boardId }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const nodeTypes = {
    card: CardNode
  };

  return (
    <div className="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        onDoubleClick={handleCreateCard}
      >
        <Background 
          color="var(--neutral-300)" 
          gap={20}
          variant="dots"
        />
        <Controls />
        <MiniMap 
          nodeColor={(node) => node.data.color}
          nodeBorderRadius={8}
        />
      </ReactFlow>
    </div>
  );
}
```

**Estilos:**
```css
.canvas-container {
  width: 100vw;
  height: 100vh;
  background: var(--neutral-50);
}

.react-flow__background {
  background: var(--neutral-50);
}

.react-flow__minimap {
  background: var(--neutral-100);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-lg);
}

.react-flow__controls {
  background: var(--neutral-100);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.react-flow__controls-button {
  background: var(--neutral-50);
  border-bottom: 1px solid var(--neutral-200);
}

.react-flow__controls-button:hover {
  background: var(--primary-100);
}
```

**Features:**
- Pan: Click e arraste no background
- Zoom: Scroll wheel
- Double-click: Cria novo card
- Delete key: Remove selecionados
- Ctrl+Z: Undo (P1)
- Ctrl+Y: Redo (P1)

---

### 6. ContentCard (Card Padrão)

**Arquivo:** `components/board/ContentCard.tsx`

**Descrição:** Card padrão com imagem, título e descrição.

**Props:**
```typescript
interface ContentCardData {
  id: string;
  title: string;
  description: string;
  image: string; // URL, emoji ou icon name
  color: string;
  tags?: string[];
  links?: string[]; // IDs de cards conectados
  parentId?: string;
}

interface ContentCardProps {
  data: ContentCardData;
  selected: boolean;
  isChild?: boolean; // Se está dentro de uma pasta expandida
}
```

**Estrutura:**
```tsx
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import Image from 'next/image';

export function ContentCard({ data, selected, isChild }: ContentCardProps) {
  const handleClick = () => {
    // Abre modal de edição ou inline edit
    openEditModal(data.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(data.id);
  };

  return (
    <motion.div
      className={cn('content-card', { 
        'content-card--selected': selected,
        'content-card--child': isChild 
      })}
      style={{ background: data.color }}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      onClick={handleClick}
    >
      {/* Handles para conexões */}
      <Handle type="source" position={Position.Right} className="card-handle" />
      <Handle type="target" position={Position.Left} className="card-handle" />

      {/* Imagem/Ícone */}
      <div className="card-image">
        {data.image.startsWith('http') ? (
          <Image 
            src={data.image} 
            alt={data.title}
            width={64}
            height={64}
            className="card-img"
          />
        ) : (
          <div className="card-icon">
            {data.image} {/* Emoji ou ícone */}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="card-body">
        <h3 className="card-title">{data.title}</h3>
        <p className="card-description">{data.description}</p>
      </div>

      {/* Tags (opcional) */}
      {data.tags && data.tags.length > 0 && (
        <div className="card-tags">
          {data.tags.slice(0, 2).map(tag => (
            <span key={tag} className="card-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Botão Delete */}
      <motion.button
        className="card-delete"
        onClick={handleDelete}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <TrashIcon />
      </motion.button>

      {/* Badge de conexões */}
      {data.links && data.links.length > 0 && (
        <div className="card-links-badge">
          <LinkIcon /> {data.links.length}
        </div>
      )}
    </motion.div>
  );
}
```

**Variantes de Animação:**
```typescript
const cardVariants = {
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: 'var(--glow-hover)',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: {
    scale: 0.98
  }
};
```

**Estilos:**
```css
.content-card {
  position: relative;
  width: 200px;
  height: 140px;
  background: var(--neutral-100);
  border: 2px solid var(--neutral-300);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-card--selected {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(255, 217, 120, 0.2);
}

.content-card--child {
  /* Estilo especial para cards dentro de pasta expandida */
  opacity: 0.95;
}

/* Glow effect on hover */
.content-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-xl);
  padding: 2px;
  background: linear-gradient(
    135deg, 
    var(--primary-300), 
    var(--primary-500)
  );
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.content-card:hover::before {
  opacity: 1;
}

/* Glass morphism effect */
.content-card {
  backdrop-filter: blur(10px);
  background: rgba(247, 245, 240, 0.9);
}

/* Imagem/Ícone */
.card-image {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--neutral-200);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-icon {
  font-size: 2rem;
  line-height: 1;
}

/* Conteúdo */
.card-body {
  flex: 1;
  text-align: center;
  overflow: hidden;
}

.card-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--neutral-800);
  margin: 0 0 var(--spacing-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-description {
  font-size: var(--text-xs);
  color: var(--neutral-600);
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tags */
.card-tags {
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
  flex-wrap: wrap;
}

.card-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--primary-200);
  color: var(--primary-800);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

/* Delete button */
.card-delete {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--accent-coral);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: 10;
}

.content-card:hover .card-delete {
  opacity: 1;
}

.card-delete:hover {
  background: #ffbea5;
}

/* Badge de conexões */
.card-links-badge {
  position: absolute;
  bottom: var(--spacing-2);
  right: var(--spacing-2);
  background: var(--primary-500);
  color: var(--neutral-900);
  border-radius: var(--radius-full);
  padding: 2px 6px;
  font-size: 10px;
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Handles (conexões) */
.card-handle {
  width: 8px;
  height: 8px;
  background: var(--primary-500);
  border: 2px solid var(--neutral-50);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.content-card:hover .card-handle {
  opacity: 1;
}
```

**Cores Pré-definidas:**
```typescript
export const CARD_COLORS = {
  cream: 'var(--primary-100)',
  yellow: 'var(--primary-200)',
  honey: 'var(--accent-honey)',
  peach: 'var(--accent-peach)',
  mint: '#E8F5E9',
  lavender: '#F3E5F5',
  sky: '#E3F2FD',
} as const;
```

---

### 6.1 FolderCard (Card Pasta)

**Arquivo:** `components/board/FolderCard.tsx`

**Descrição:** Card especial que funciona como pasta, contendo outros cards.

**Props:**
```typescript
interface FolderCardData {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
  children: string[]; // IDs dos cards filhos
  isExpanded: boolean;
  layoutStyle: 'circle' | 'grid' | 'burst';
}

interface FolderCardProps {
  data: FolderCardData;
  selected: boolean;
  onToggleExpand: (id: string) => void;
}
```

**Estrutura:**
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { FolderIcon } from 'lucide-react';

export function FolderCard({ data, selected, onToggleExpand }: FolderCardProps) {
  const childCards = useCardStore(state => 
    state.cards.filter(c => data.children.includes(c.id))
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(data.id);
  };

  return (
    <>
      {/* Card Pasta Principal */}
      <motion.div
        className={cn('folder-card', { 
          'folder-card--selected': selected,
          'folder-card--expanded': data.isExpanded 
        })}
        style={{ background: data.color }}
        whileHover="hover"
        whileTap="tap"
        variants={folderVariants}
        onClick={handleClick}
        animate={data.isExpanded ? 'expanded' : 'collapsed'}
      >
        {/* Ícone de Pasta */}
        <div className="card-image">
          <div className="folder-icon-wrapper">
            <FolderIcon size={32} />
            {data.isExpanded && (
              <motion.div 
                className="folder-open-indicator"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="card-body">
          <h3 className="card-title">{data.title}</h3>
          <p className="card-description">{data.description}</p>
        </div>

        {/* Badge com contador */}
        <div className="folder-badge">
          <span>{data.children.length}</span>
        </div>

        {/* Botão Delete */}
        <motion.button
          className="card-delete"
          onClick={(e) => {
            e.stopPropagation();
            deleteCard(data.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <TrashIcon />
        </motion.button>
      </motion.div>

      {/* Cards Filhos (quando expandido) */}
      <AnimatePresence>
        {data.isExpanded && (
          <motion.div className="folder-children">
            {childCards.map((child, index) => (
              <motion.div
                key={child.id}
                custom={index}
                variants={burstVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  position: 'absolute',
                  ...calculateChildPosition(index, childCards.length, data.layoutStyle)
                }}
              >
                <ContentCard 
                  data={child} 
                  selected={false}
                  isChild={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Linhas de Conexão (quando expandido) */}
      <AnimatePresence>
        {data.isExpanded && (
          <svg className="folder-connections">
            {childCards.map((child, index) => {
              const childPos = calculateChildPosition(index, childCards.length, data.layoutStyle);
              return (
                <motion.line
                  key={child.id}
                  x1="100" // Centro da pasta
                  y1="70"
                  x2={childPos.left + 100}
                  y2={childPos.top + 70}
                  stroke="var(--primary-300)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                />
              );
            })}
          </svg>
        )}
      </AnimatePresence>
    </>
  );
}

// Calcula posição dos cards filhos baseado no layout
function calculateChildPosition(
  index: number, 
  total: number, 
  layout: 'circle' | 'grid' | 'burst'
) {
  const RADIUS = 350; // Distância da pasta
  
  if (layout === 'circle') {
    const angle = (index / total) * Math.PI * 2;
    return {
      left: Math.cos(angle) * RADIUS,
      top: Math.sin(angle) * RADIUS,
    };
  }
  
  if (layout === 'grid') {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      left: (col - cols / 2) * 250,
      top: (row - Math.floor(total / cols) / 2) * 200,
    };
  }
  
  // Burst (posições aleatórias controladas)
  const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
  const distance = RADIUS + (Math.random() - 0.5) * 100;
  return {
    left: Math.cos(angle) * distance,
    top: Math.sin(angle) * distance,
  };
}
```

**Variantes de Animação:**
```typescript
const folderVariants = {
  hover: {
    y: -8,
    scale: 1.05,
    boxShadow: 'var(--glow-hover)',
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95
  },
  expanded: {
    scale: 1.05,
    boxShadow: '0 0 40px rgba(255, 217, 120, 0.6)',
    transition: { duration: 0.3 }
  },
  collapsed: {
    scale: 1,
    boxShadow: 'var(--shadow-md)',
  }
};

const burstVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    x: 0,
    y: 0
  },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    x: 0, // Calculado via style inline
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: index * 0.05
    }
  }),
  exit: {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
    transition: {
      duration: 0.2
    }
  }
};
```

**Estilos:**
```css
.folder-card {
  position: relative;
  width: 200px;
  height: 140px;
  background: var(--primary-200);
  border: 2px solid var(--primary-400);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  overflow: visible; /* Importante para ver filhos */
}

.folder-card--expanded {
  border-color: var(--primary-600);
  background: rgba(255, 244, 209, 0.7); /* Mais transparente */
  z-index: 50;
}

/* Ícone de pasta */
.folder-icon-wrapper {
  position: relative;
  color: var(--primary-700);
}

.folder-open-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: var(--primary-600);
  border-radius: 50%;
  border: 2px solid var(--neutral-50);
}

/* Badge contador */
.folder-badge {
  position: absolute;
  top: var(--spacing-2);
  left: var(--spacing-2);
  background: var(--primary-600);
  color: var(--neutral-900);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-sm);
}

/* Container dos filhos */
.folder-children {
  position: relative;
  pointer-events: none; /* Permite interação com filhos */
}

.folder-children > * {
  pointer-events: all; /* Re-habilita para filhos */
}

/* Conexões (linhas) */
.folder-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
}

/* Efeito de pulso no hover */
.folder-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl);
  background: radial-gradient(
    circle at center,
    rgba(255, 217, 120, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  animation: pulse 2s ease-in-out infinite;
}

.folder-card--expanded::after {
  opacity: 1;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}
```

---

### 6.2 CloudLayout (Efeito de Nuvem)

**Arquivo:** `components/board/CloudLayout.tsx`

**Descrição:** Sistema de física para organizar cards em nuvem/grafo.

**Implementação com D3-Force:**
```tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3-force';

interface CloudLayoutProps {
  cards: Card[];
  onPositionsUpdate: (positions: Record<string, { x: number; y: number }>) => void;
  enabled: boolean;
}

export function CloudLayout({ cards, onPositionsUpdate, enabled }: CloudLayoutProps) {
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  useEffect(() => {
    if (!enabled || cards.length === 0) return;

    // Criar nós para simulação
    const nodes = cards.map(card => ({
      id: card.id,
      x: card.position.x,
      y: card.position.y,
      fx: card.position.x, // Fixed se estiver sendo arrastado
      fy: card.position.y,
    }));

    // Criar links (conexões entre cards)
    const links = cards.flatMap(card => 
      (card.links || []).map(targetId => ({
        source: card.id,
        target: targetId,
      }))
    );

    // Configurar simulação de força
    const simulation = d3.forceSimulation(nodes)
      // Atração entre nós conectados
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(250) // Distância ideal entre nós conectados
        .strength(0.5)
      )
      // Repulsão entre todos os nós (evita sobreposição)
      .force('charge', d3.forceManyBody()
        .strength(-800) // Força de repulsão
        .distanceMax(600)
      )
      // Centralização suave
      .force('center', d3.forceCenter(0, 0).strength(0.05))
      // Previne sobreposição de nós
      .force('collision', d3.forceCollide()
        .radius(120) // Raio de colisão (tamanho do card)
        .strength(0.7)
      )
      // Velocidade decay (estabilização)
      .velocityDecay(0.3)
      .alphaDecay(0.02);

    // Atualizar posições a cada tick
    simulation.on('tick', () => {
      const positions: Record<string, { x: number; y: number }> = {};
      nodes.forEach(node => {
        positions[node.id] = { x: node.x!, y: node.y! };
      });
      onPositionsUpdate(positions);
    });

    simulationRef.current = simulation;

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [cards, enabled]);

  // Método para atualizar posição de um nó (quando arrastado)
  const updateNodePosition = (id: string, x: number, y: number, fixed = false) => {
    if (!simulationRef.current) return;

    const node = simulationRef.current.nodes().find((n: any) => n.id === id);
    if (node) {
      node.fx = fixed ? x : null;
      node.fy = fixed ? y : null;
      if (!fixed) {
        node.x = x;
        node.y = y;
      }
      simulationRef.current.alpha(0.3).restart();
    }
  };

  // Expõe método via ref (usar com useImperativeHandle)
  return null; // Componente sem renderização
}
```

**Integração no Canvas:**
```tsx
export function Canvas({ boardId }: CanvasProps) {
  const [cloudEnabled, setCloudEnabled] = useState(true);
  const cards = useBoardStore(state => state.cards);
  const updateCardPosition = useBoardStore(state => state.updateCard);

  const handlePositionsUpdate = (positions: Record<string, { x: number; y: number }>) => {
    // Atualiza posições dos cards suavemente
    Object.entries(positions).forEach(([id, pos]) => {
      updateCardPosition(id, { position: pos });
    });
  };

  return (
    <div className="canvas-container">
      {/* Sistema de física (invisível) */}
      <CloudLayout 
        cards={cards}
        onPositionsUpdate={handlePositionsUpdate}
        enabled={cloudEnabled}
      />

      {/* Canvas visual */}
      <ReactFlow nodes={nodes} edges={edges} {...props}>
        {/* ... */}
      </ReactFlow>

      {/* Toggle cloud mode */}
      <button 
        onClick={() => setCloudEnabled(!cloudEnabled)}
        className="cloud-toggle"
      >
        {cloudEnabled ? 'Desativar Nuvem' : 'Ativar Nuvem'}
      </button>
    </div>
  );
}
```

**Configurações Alternativas:**

```typescript
// Configuração "Relaxada" (mais espaçoso)
const relaxedForces = {
  link: { distance: 300, strength: 0.3 },
  charge: { strength: -1000, distanceMax: 800 },
  collision: { radius: 150, strength: 0.8 }
};

// Configuração "Compacta" (mais junto)
const compactForces = {
  link: { distance: 200, strength: 0.7 },
  charge: { strength: -500, distanceMax: 400 },
  collision: { radius: 100, strength: 0.6 }
};

// Configuração "Orgânica" (mais natural)
const organicForces = {
  link: { distance: 250, strength: 0.5 },
  charge: { strength: -600, distanceMax: 600 },
  collision: { radius: 120, strength: 0.7 },
  velocityDecay: 0.4, // Mais suave
  alphaDecay: 0.01 // Estabiliza mais devagar
};
```

**Animação Suave das Posições:**
```tsx
// No CardNode, usar motion para suavizar movimento
<motion.div
  animate={{
    x: position.x,
    y: position.y
  }}
  transition={{
    type: 'spring',
    stiffness: 100,
    damping: 20
  }}
>
  {/* Card content */}
</motion.div>
```

---

### 7. Toolbar

**Arquivo:** `components/board/Toolbar.tsx`

**Descrição:** Barra de ferramentas flutuante.

**Props:**
```typescript
interface ToolbarProps {
  onCreateCard: () => void;
  onDeleteSelected: () => void;
  onResetView: () => void;
  hasSelection: boolean;
}
```

**Estrutura:**
```tsx
export function Toolbar({
  onCreateCard,
  onDeleteSelected,
  onResetView,
  hasSelection
}: ToolbarProps) {
  return (
    <motion.div 
      className="toolbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring' }}
    >
      <Tooltip content="Criar Card (Double-click)">
        <IconButton onClick={onCreateCard}>
          <PlusIcon />
        </IconButton>
      </Tooltip>

      <div className="toolbar-divider" />

      <Tooltip content="Deletar Selecionados (Delete)">
        <IconButton 
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          variant="danger"
        >
          <TrashIcon />
        </IconButton>
      </Tooltip>

      <div className="toolbar-divider" />

      <Tooltip content="Resetar Visualização">
        <IconButton onClick={onResetView}>
          <FitViewIcon />
        </IconButton>
      </Tooltip>

      <div className="toolbar-divider" />

      <ColorPicker />

      <div className="toolbar-divider" />

      <UserButton /> {/* Clerk component */}
    </motion.div>
  );
}
```

**Estilos:**
```css
.toolbar {
  position: fixed;
  top: var(--spacing-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--neutral-50);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--neutral-300);
}
```

---

### 8. Minimap (React Flow built-in)

**Configuração:**
```tsx
<MiniMap 
  nodeColor={(node) => {
    if (node.selected) return 'var(--primary-500)';
    return node.data.color || 'var(--neutral-200)';
  }}
  nodeBorderRadius={8}
  nodeStrokeWidth={2}
  maskColor="rgba(247, 245, 240, 0.8)"
  style={{
    background: 'var(--neutral-100)',
    border: '1px solid var(--neutral-300)',
    borderRadius: 'var(--radius-lg)',
  }}
/>
```

---

### 9. EmptyState

**Arquivo:** `components/board/EmptyState.tsx`

**Descrição:** Estado vazio quando não há cards.

```tsx
export function EmptyState() {
  return (
    <motion.div 
      className="empty-state"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="empty-state-icon">
        <SparklesIcon />
      </div>
      <h2>Seu board está vazio</h2>
      <p>
        Dê um <strong>duplo clique</strong> em qualquer lugar
        <br />
        para criar seu primeiro card
      </p>
      <Button 
        variant="primary" 
        size="lg"
        leftIcon={<PlusIcon />}
      >
        Criar Card
      </Button>
    </motion.div>
  );
}
```

**Estilos:**
```css
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  max-width: 400px;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-6);
  background: var(--primary-200);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-700);
}

.empty-state h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--neutral-800);
  margin-bottom: var(--spacing-3);
}

.empty-state p {
  font-size: var(--text-base);
  color: var(--neutral-600);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--spacing-6);
}
```

---

## 🔧 Utility Components

### 10. IconButton

**Arquivo:** `components/design-system/IconButton.tsx`

```typescript
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

**Estilos:**
```css
.icon-button {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--neutral-700);
}

.icon-button:hover {
  background: var(--neutral-200);
  color: var(--neutral-900);
}

.icon-button:active {
  transform: scale(0.95);
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-button--danger:hover {
  background: var(--accent-coral);
  color: var(--neutral-900);
}
```

---

### 11. ColorPicker

**Arquivo:** `components/board/ColorPicker.tsx`

**Descrição:** Seletor de cor para cards.

```tsx
export function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS.cream);

  return (
    <div className="color-picker">
      {Object.entries(CARD_COLORS).map(([name, color]) => (
        <motion.button
          key={name}
          className={cn('color-swatch', {
            'color-swatch--selected': selectedColor === color
          })}
          style={{ background: color }}
          onClick={() => setSelectedColor(color)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
      ))}
    </div>
  );
}
```

**Estilos:**
```css
.color-picker {
  display: flex;
  gap: var(--spacing-2);
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.color-swatch--selected {
  border-color: var(--primary-700);
  box-shadow: 0 0 0 2px var(--primary-200);
}
```

---

## 🏗️ Provider Components

### 12. BoardProvider

**Arquivo:** `components/providers/BoardProvider.tsx`

**Descrição:** Context provider para estado do board.

```typescript
interface BoardContextType {
  boardId: string;
  cards: Card[];
  selectedCards: string[];
  addCard: (card: Partial<Card>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  selectCard: (id: string) => void;
  clearSelection: () => void;
}

export const BoardContext = createContext<BoardContextType | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  // Usa Zustand store internamente
  const store = useBoardStore();

  return (
    <BoardContext.Provider value={store}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
}
```

---

## 📦 Zustand Store

**Arquivo:** `lib/stores/boardStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Card {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BoardState {
  cards: Card[];
  selectedCards: string[];
  viewport: { x: number; y: number; zoom: number };
  
  // Actions
  addCard: (card: Partial<Card>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  deleteSelectedCards: () => void;
  selectCard: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setViewport: (viewport: Partial<BoardState['viewport']>) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      cards: [],
      selectedCards: [],
      viewport: { x: 0, y: 0, zoom: 1 },

      addCard: (card) => {
        const newCard: Card = {
          id: crypto.randomUUID(),
          position: card.position || { x: 0, y: 0 },
          size: card.size || { width: 300, height: 200 },
          content: card.content || '',
          color: card.color || CARD_COLORS.cream,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? { ...card, ...updates, updatedAt: new Date() }
              : card
          ),
        }));
      },

      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          selectedCards: state.selectedCards.filter((cid) => cid !== id),
        }));
      },

      deleteSelectedCards: () => {
        const { selectedCards } = get();
        set((state) => ({
          cards: state.cards.filter((card) => !selectedCards.includes(card.id)),
          selectedCards: [],
        }));
      },

      selectCard: (id, multi = false) => {
        set((state) => {
          if (multi) {
            const isSelected = state.selectedCards.includes(id);
            return {
              selectedCards: isSelected
                ? state.selectedCards.filter((cid) => cid !== id)
                : [...state.selectedCards, id],
            };
          }
          return { selectedCards: [id] };
        });
      },

      clearSelection: () => {
        set({ selectedCards: [] });
      },

      setViewport: (viewport) => {
        set((state) => ({
          viewport: { ...state.viewport, ...viewport },
        }));
      },
    }),
    {
      name: 'infinite-board-storage',
      version: 1,
    }
  )
);
```

---

## 🎭 Animação Patterns

### Hover Effects

```typescript
const hoverEffect = {
  scale: 1.02,
  y: -4,
  boxShadow: 'var(--glow-hover)',
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};
```

### Drag Effects

```typescript
const dragEffect = {
  scale: 1.05,
  rotate: [0, -2, 2, 0],
  boxShadow: 'var(--shadow-xl)',
  zIndex: 999,
  transition: {
    rotate: {
      repeat: Infinity,
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
};
```

### Page Transitions

```typescript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};
```

---

## 🎨 CSS Variables Usage

**Em qualquer componente:**
```tsx
<div 
  style={{
    background: 'var(--primary-100)',
    borderColor: 'var(--primary-300)',
    boxShadow: 'var(--shadow-md)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-4)',
  }}
/>
```

**Com Tailwind (custom config):**
```tsx
<div className="bg-primary-100 border-primary-300 shadow-md rounded-lg p-4" />
```

---

## 📱 Responsividade

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

### Mobile Adaptations

**Canvas:**
- Touch gestures para pan/zoom
- Botões maiores (min 44px)
- Toolbar adaptativo (vertical em mobile)

**Cards:**
- Tamanho mínimo maior (200x150px)
- Edição em modal full-screen
- Gestos simplificados

---

## ♿ Acessibilidade

### Keyboard Navigation

```typescript
// Global keyboard shortcuts
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    // Delete selected cards
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelectedCards();
    }
    
    // Deselect all
    if (e.key === 'Escape') {
      clearSelection();
    }
    
    // Undo (P1)
    if (e.ctrlKey && e.key === 'z') {
      undo();
    }
    
    // Redo (P1)
    if (e.ctrlKey && e.key === 'y') {
      redo();
    }
  };

  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, []);
```

### ARIA Labels

```tsx
<button 
  aria-label="Criar novo card"
  aria-keyshortcuts="Double-click no canvas"
>
  <PlusIcon aria-hidden="true" />
</button>

<div 
  role="article"
  aria-label={`Card: ${content}`}
  tabIndex={0}
>
  {content}
</div>
```

---

## 🧪 Testing Patterns (P1)

### Component Tests

```typescript
describe('CardNode', () => {
  it('should render content', () => {
    render(<CardNode data={{ content: 'Test' }} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should enter edit mode on click', () => {
    render(<CardNode data={{ content: 'Test' }} />);
    fireEvent.click(screen.getByText('Test'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show hover effect', () => {
    const { container } = render(<CardNode data={{ content: 'Test' }} />);
    const card = container.firstChild;
    fireEvent.mouseEnter(card);
    // Assert hover styles
  });
});
```

---

## 📝 Type Definitions

**Arquivo:** `lib/types/index.ts`

```typescript
export interface Card {
  id: string;
  position: Position;
  size: Size;
  content: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Board {
  id: string;
  name: string;
  cards: Card[];
  viewport: Viewport;
  createdAt: Date;
  updatedAt: Date;
}

export type CardColor = keyof typeof CARD_COLORS;

export interface BoardState {
  cards: Card[];
  selectedCards: string[];
  viewport: Viewport;
}
```

---

*Última atualização: 13 de Fevereiro de 2026*
