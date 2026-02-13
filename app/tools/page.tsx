'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Canvas, getOrbitalPosition } from '@/components/board/Canvas';
import { Toolbar } from '@/components/board/Toolbar';
import { SidePanel } from '@/components/board/SidePanel';
import { useBoardStore } from '@/lib/stores/boardStore';
import { CARD_EMOJIS } from '@/lib/types';

export default function ToolsPage() {
  const { isSignedIn } = useAuth();
  const canEdit = !!isSignedIn;
  const [loaded, setLoaded] = useState(false);

  const addCard = useBoardStore((state) => state.addCard);
  const deleteSelectedCards = useBoardStore((state) => state.deleteSelectedCards);
  const cloudEnabled = useBoardStore((state) => state.cloudEnabled);
  const toggleCloud = useBoardStore((state) => state.toggleCloud);
  const hydrate = useBoardStore((state) => state.hydrate);
  const cards = useBoardStore((state) => state.cards);
  const viewport = useBoardStore((state) => state.viewport);
  const selectedCards = useBoardStore((state) => state.selectedCards);
  const clearSelection = useBoardStore((state) => state.clearSelection);

  const selectedCard =
    selectedCards.length === 1
      ? cards.find((c) => c.id === selectedCards[0]) ?? null
      : null;

  // Carregar estado global (o mesmo para todos)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/tools/state')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.cards) return;
        hydrate({
          cards: data.cards,
          viewport: data.viewport ?? { x: 0, y: 0, zoom: 1 },
          cloudEnabled: data.cloudEnabled ?? true,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  const [saving, setSaving] = useState(false);
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/tools/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards,
          viewport,
          cloudEnabled,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        // feedback opcional: toast ou "Salvo!"
      }
    } catch {
      // erro
    } finally {
      setSaving(false);
    }
  }, [cards, viewport, cloudEnabled]);

  const handleCreateCard = useCallback(() => {
    const randomEmoji = CARD_EMOJIS[Math.floor(Math.random() * CARD_EMOJIS.length)];
    const topLevelCount = cards.filter((c) => !c.parentId).length;
    addCard({
      type: 'content',
      title: 'Novo Card',
      description: 'Adicione uma descrição...',
      image: randomEmoji,
      position: getOrbitalPosition(topLevelCount, topLevelCount + 1),
    });
  }, [addCard, cards]);

  const handleCreateFolder = useCallback(() => {
    const topLevelCount = cards.filter((c) => !c.parentId).length;
    addCard({
      type: 'folder',
      title: 'Nova Pasta',
      description: 'Arraste cards para dentro',
      image: '📁',
      position: getOrbitalPosition(topLevelCount, topLevelCount + 1),
    });
  }, [addCard, cards]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedCards.length > 0) {
      if (confirm(`Deletar ${selectedCards.length} card(s)?`)) {
        deleteSelectedCards();
      }
    }
  }, [selectedCards, deleteSelectedCards]);

  const handleResetView = useCallback(() => {});

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-50)]">
        <div className="w-8 h-8 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Toolbar
        onCreateCard={handleCreateCard}
        onCreateFolder={handleCreateFolder}
        onDeleteSelected={handleDeleteSelected}
        onResetView={handleResetView}
        onToggleCloud={toggleCloud}
        onSave={handleSave}
        hasSelection={selectedCards.length > 0}
        cloudEnabled={cloudEnabled}
        canEdit={canEdit}
      />

      {canEdit && (
        <span
          className="fixed top-4 right-4 z-[var(--z-fixed)] text-xs text-[var(--neutral-500)]"
          aria-live="polite"
        >
          {saving ? 'Salvando…' : ''}
        </span>
      )}

      {selectedCard && (
        <SidePanel
          card={selectedCard}
          onClose={clearSelection}
          readOnly={!canEdit}
        />
      )}

      <Canvas readOnly={!canEdit} />
    </div>
  );
}
