/**
 * Zustand Store - Board State Management
 * Manages cards, selection, viewport, and board interactions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, ContentCard, FolderCard, BoardState, Viewport, Position } from '@/lib/types';
import { CARD_COLORS, DEFAULT_CARD_SIZE, DEFAULT_VIEWPORT } from '@/lib/types';

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================
      
      cards: [],
      selectedCards: [],
      exitingCardIds: [],
      viewport: DEFAULT_VIEWPORT,
      cloudEnabled: true,
      hasBeenHydrated: false,

      // ============================================
      // CARD ACTIONS
      // ============================================
      
      addCard: (cardData) => {
        const baseCard = {
          id: crypto.randomUUID(),
          type: cardData.type || 'content',
          position: cardData.position || { 
            x: Math.random() * 400 - 200, 
            y: Math.random() * 400 - 200 
          },
          title: cardData.title || 'Novo Card',
          description: cardData.description || 'Adicione uma descrição...',
          image: cardData.image || '📝',
          color: cardData.color || CARD_COLORS.cream,
          parentId: cardData.parentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newCard: Card = cardData.type === 'folder' 
          ? {
              ...baseCard,
              type: 'folder' as const,
              children: [],
              links: (cardData as Partial<FolderCard>).links || [],
              isExpanded: false,
              layoutStyle: 'circle' as const,
            } as FolderCard
          : {
              ...baseCard,
              type: 'content' as const,
              tags: (cardData as Partial<ContentCard>).tags || [],
              links: (cardData as Partial<ContentCard>).links || [],
              url: (cardData as Partial<ContentCard>).url,
            } as ContentCard;

        set((state) => ({ cards: [...state.cards, newCard] }));
        return newCard.id;
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? { ...card, ...updates, updatedAt: new Date() } as Card
              : card
          ),
        }));
      },

      deleteCard: (id) => {
        const card = get().cards.find(c => c.id === id);
        
        // Se for pasta, remove os filhos também (ou libera eles)
        if (card?.type === 'folder') {
          const folder = card as FolderCard;
          // Opção 1: Deletar filhos
          // set((state) => ({
          //   cards: state.cards.filter(c => 
          //     c.id !== id && !folder.children.includes(c.id)
          //   ),
          // }));
          
          // Opção 2: Liberar filhos (remove parentId)
          set((state) => ({
            cards: state.cards.filter(c => c.id !== id).map(c => 
              folder.children.includes(c.id) 
                ? { ...c, parentId: undefined }
                : c
            ),
            selectedCards: state.selectedCards.filter((cid) => cid !== id),
          }));
        } else {
          set((state) => ({
            cards: state.cards.filter((card) => card.id !== id),
            selectedCards: state.selectedCards.filter((cid) => cid !== id),
          }));
        }
      },

      deleteSelectedCards: () => {
        const { selectedCards, deleteCard } = get();
        selectedCards.forEach((id) => deleteCard(id));
        set({ selectedCards: [], exitingCardIds: [] });
      },

      setExitingCards: (ids) => {
        set({ exitingCardIds: ids });
      },

      // ============================================
      // SELECTION ACTIONS
      // ============================================
      
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

      // ============================================
      // VIEWPORT ACTIONS
      // ============================================
      
      setViewport: (viewport) => {
        set((state) => ({
          viewport: { ...state.viewport, ...viewport },
        }));
      },

      // ============================================
      // CLOUD/PHYSICS ACTIONS
      // ============================================
      
      toggleCloud: () => {
        set((state) => ({ cloudEnabled: !state.cloudEnabled }));
      },

      // ============================================
      // FOLDER ACTIONS
      // ============================================
      
      toggleFolder: (id) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id && card.type === 'folder'
              ? { 
                  ...card, 
                  isExpanded: !(card as FolderCard).isExpanded,
                  updatedAt: new Date()
                }
              : card
          ),
        }));
      },

      addCardToFolder: (cardId, folderId) => {
        const folder = get().cards.find(c => c.id === folderId && c.type === 'folder') as FolderCard;
        if (!folder) return;

        set((state) => ({
          cards: state.cards.map((card) => {
            // Atualizar a pasta
            if (card.id === folderId && card.type === 'folder') {
              const folderCard = card as FolderCard;
              return {
                ...folderCard,
                children: [...folderCard.children, cardId],
                updatedAt: new Date(),
              };
            }
            // Atualizar o card (adicionar parentId)
            if (card.id === cardId) {
              return {
                ...card,
                parentId: folderId,
                updatedAt: new Date(),
              };
            }
            return card;
          }),
        }));
      },

      removeCardFromFolder: (cardId, folderId) => {
        set((state) => ({
          cards: state.cards.map((card) => {
            // Atualizar a pasta
            if (card.id === folderId && card.type === 'folder') {
              const folderCard = card as FolderCard;
              return {
                ...folderCard,
                children: folderCard.children.filter((id) => id !== cardId),
                updatedAt: new Date(),
              };
            }
            if (card.id === cardId) {
              return {
                ...card,
                parentId: undefined,
                updatedAt: new Date(),
              };
            }
            return card;
          }),
        }));
      },

      hydrate: (payload) => {
        const parseCard = (c: Card & { createdAt?: string | Date; updatedAt?: string | Date }): Card => {
          const base = {
            ...c,
            createdAt: typeof c.createdAt === 'string' ? new Date(c.createdAt) : c.createdAt,
            updatedAt: typeof c.updatedAt === 'string' ? new Date(c.updatedAt) : c.updatedAt,
          };
          return base as Card;
        };
        set({
          cards: payload.cards.map(parseCard),
          viewport: payload.viewport,
          cloudEnabled: payload.cloudEnabled,
          hasBeenHydrated: true,
        });
      },
    }),
    {
      name: 'infinite-board-storage',
      version: 3,
      // Autosave desabilitado: nada é persistido automaticamente. Salvar serve apenas para
      // criação/edição de cards e pastas (botão Salvar envia para a API).
      partialize: () => ({}),
    }
  )
);

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get cards that are not inside folders (top-level)
export const useTopLevelCards = () => {
  const cards = useBoardStore((state) => state.cards);
  return cards.filter((card) => !card.parentId);
};

// Get children of a specific folder
export const useFolderChildren = (folderId: string) => {
  const cards = useBoardStore((state) => state.cards);
  const folder = cards.find(c => c.id === folderId && c.type === 'folder') as FolderCard;
  
  if (!folder) return [];
  
  return cards.filter((card) => folder.children.includes(card.id));
};

// Get selected cards data
export const useSelectedCardsData = () => {
  const cards = useBoardStore((state) => state.cards);
  const selectedIds = useBoardStore((state) => state.selectedCards);
  
  return cards.filter((card) => selectedIds.includes(card.id));
};
