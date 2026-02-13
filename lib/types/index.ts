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
}

export interface FolderCard extends BaseCard {
  type: 'folder';
  children: string[]; // IDs dos cards filhos
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
  viewport: Viewport;
  cloudEnabled: boolean;
  
  // Actions
  addCard: (card: Partial<Card>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  deleteSelectedCards: () => void;
  selectCard: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setViewport: (viewport: Partial<Viewport>) => void;
  toggleCloud: () => void;
  toggleFolder: (id: string) => void;
  addCardToFolder: (cardId: string, folderId: string) => void;
  removeCardFromFolder: (cardId: string, folderId: string) => void;
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface ContentCardProps {
  data: ContentCard;
  selected: boolean;
  isChild?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface FolderCardProps {
  data: FolderCard;
  selected: boolean;
  onToggleExpand: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface CanvasProps {
  boardId: string;
}

export interface ToolbarProps {
  onCreateCard: () => void;
  onCreateFolder: () => void;
  onDeleteSelected: () => void;
  onResetView: () => void;
  onToggleCloud: () => void;
  hasSelection: boolean;
  cloudEnabled: boolean;
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
  '📚', '🔨', '🎯', '🌟', '🎉', '💪', '🎮', '🎬',
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
