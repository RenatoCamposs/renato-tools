'use client';

import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Canvas } from '@/components/board/Canvas';
import { Toolbar } from '@/components/board/Toolbar';
import { useBoardStore } from '@/lib/stores/boardStore';
import { CARD_EMOJIS } from '@/lib/types';

export default function BoardPage() {
  const { isSignedIn } = useAuth();
  const canEdit = !!isSignedIn;

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
        canEdit={canEdit}
      />

      {!canEdit && (
        <Link
          href="/secret-admin"
          className="fixed bottom-4 right-4 z-[var(--z-fixed)] text-xs text-[var(--neutral-500)] hover:text-[var(--primary-600)] transition-colors"
        >
          Admin
        </Link>
      )}

      <Canvas readOnly={!canEdit} />
    </div>
  );
}
