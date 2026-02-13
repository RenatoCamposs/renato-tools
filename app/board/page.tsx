'use client';

import { useCallback } from 'react';
import { Canvas } from '@/components/board/Canvas';
import { Toolbar } from '@/components/board/Toolbar';
import { useBoardStore } from '@/lib/stores/boardStore';
import { CARD_EMOJIS } from '@/lib/types';

export default function BoardPage() {
  const addCard = useBoardStore((state) => state.addCard);
  const deleteSelectedCards = useBoardStore((state) => state.deleteSelectedCards);
  const selectedCards = useBoardStore((state) => state.selectedCards);
  const cloudEnabled = useBoardStore((state) => state.cloudEnabled);
  const toggleCloud = useBoardStore((state) => state.toggleCloud);

  const handleCreateCard = useCallback(() => {
    const randomEmoji = CARD_EMOJIS[Math.floor(Math.random() * CARD_EMOJIS.length)];
    addCard({
      type: 'content',
      title: 'Novo Card',
      description: 'Adicione uma descrição...',
      image: randomEmoji,
      position: { 
        x: Math.random() * 400 - 200, 
        y: Math.random() * 400 - 200 
      },
    });
  }, [addCard]);

  const handleCreateFolder = useCallback(() => {
    addCard({
      type: 'folder',
      title: 'Nova Pasta',
      description: 'Arraste cards para dentro',
      image: '📁',
      position: { 
        x: Math.random() * 400 - 200, 
        y: Math.random() * 400 - 200 
      },
    });
  }, [addCard]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedCards.length > 0) {
      if (confirm(`Deletar ${selectedCards.length} card(s)?`)) {
        deleteSelectedCards();
      }
    }
  }, [selectedCards, deleteSelectedCards]);

  const handleResetView = useCallback(() => {
    // Reset zoom e posição (implementado via React Flow controls)
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Toolbar
        onCreateCard={handleCreateCard}
        onCreateFolder={handleCreateFolder}
        onDeleteSelected={handleDeleteSelected}
        onResetView={handleResetView}
        onToggleCloud={toggleCloud}
        hasSelection={selectedCards.length > 0}
        cloudEnabled={cloudEnabled}
      />
      
      <Canvas />
    </div>
  );
}
