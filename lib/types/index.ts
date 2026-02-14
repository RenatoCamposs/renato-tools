/**
 * Type Definitions - Infinite Board App
 */

// ============================================
// CARD TYPES
// ============================================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseCard {
  id: string;
  type: 'content' | 'folder';
  position: Position;
  title: string;
  description: string;
  image: string; // URL, emoji, or icon name
  color: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentCard extends BaseCard {
  type: 'content';
  tags?: string[];
  links?: string[]; // IDs de cards conectados
  /** URL do link (bookmark); em view-only, clique abre em nova aba */
  url?: string;
}

export interface FolderCard extends BaseCard {
  type: 'folder';
  children: string[]; // IDs dos cards filhos
  links?: string[]; // IDs de cards conectados (pastas ou itens)
  isExpanded: boolean;
  layoutStyle: 'circle' | 'grid' | 'burst';
}

export type Card = ContentCard | FolderCard;

// ============================================
// BOARD TYPES
// ============================================

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

// ============================================
// STORE TYPES
// ============================================

export interface BoardState {
  cards: Card[];
  selectedCards: string[];
  /** IDs em animação de saída (exit) antes de remover do store */
  exitingCardIds: string[];
  viewport: Viewport;
  cloudEnabled: boolean;
  /** true após hydrate (API); evita sobrescrever posições com layout orbital ao carregar */
  hasBeenHydrated: boolean;

  // Actions
  addCard: (card: Partial<Card>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  deleteSelectedCards: () => void;
  setExitingCards: (ids: string[]) => void;
  selectCard: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setViewport: (viewport: Partial<Viewport>) => void;
  toggleCloud: () => void;
  toggleFolder: (id: string) => void;
  addCardToFolder: (cardId: string, folderId: string) => void;
  removeCardFromFolder: (cardId: string, folderId: string) => void;
  /** Carrega estado global (API) — exibido para todos */
  hydrate: (payload: { cards: Card[]; viewport: Viewport; cloudEnabled: boolean }) => void;
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface ContentCardProps {
  data: ContentCard;
  selected: boolean;
  isChild?: boolean;
  isExiting?: boolean;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface FolderCardProps {
  data: FolderCard;
  selected: boolean;
  onToggleExpand: (id: string) => void;
  isExiting?: boolean;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface CanvasProps {
  boardId?: string;
  readOnly?: boolean; // true = só visualização (pan/zoom, expandir pasta)
}

export interface ToolbarProps {
  onCreateCard: () => void;
  onCreateFolder: () => void;
  onCreateBookmark?: () => void;
  onDeleteSelected: () => void;
  onResetView: () => void;
  onToggleCloud: () => void;
  onSave?: () => void | Promise<void>; // Salvar estado global (visível para todos)
  /** Exportar posições dos cards (modo edit, apenas admin) */
  onExportPositions?: () => void;
  /** Abre seletor de arquivo para importar posições (modo edit, apenas admin) */
  onImportPositions?: () => void;
  hasSelection: boolean;
  cloudEnabled: boolean;
  canEdit?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

export const CARD_COLORS = {
  cream: 'var(--card-cream)',
  yellow: 'var(--card-yellow)',
  honey: 'var(--card-honey)',
  peach: 'var(--card-peach)',
  mint: 'var(--card-mint)',
  lavender: 'var(--card-lavender)',
  sky: 'var(--card-sky)',
} as const;

export type CardColor = keyof typeof CARD_COLORS;

export const CARD_EMOJIS = [
  '📝', '💡', '🎯', '🚀', '⭐', '🔥', '💎', '🎨',
  '📚', '🔨', '🌟', '🎉', '💪', '🎮', '🎬',
  '📱', '💻', '🖥️', '⌚', '📷', '🎧', '🎵', '🎸',
  '🏆', '🎓', '📊', '📈', '💰', '🏠', '🌍', '✈️',
] as const;

export const DEFAULT_CARD_SIZE: Size = {
  width: 200,
  height: 140,
};

export const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};
