'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Canvas, getOrbitalPosition } from '@/components/board/Canvas';
import { Toolbar } from '@/components/board/Toolbar';
import { SidePanel } from '@/components/board/SidePanel';
import { useBoardStore } from '@/lib/stores/boardStore';
import { CARD_EMOJIS } from '@/lib/types';

function BookmarkDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
}) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const u = url.trim();
      if (!u) return;
      setError('');
      setLoading(true);
      try {
        await onSubmit(u);
        setUrl('');
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar preview');
      } finally {
        setLoading(false);
      }
    },
    [url, onSubmit, onClose]
  );

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[var(--z-fixed)] flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Adicionar bookmark"
    >
      <div
        className="rounded-2xl bg-[var(--neutral-50)] shadow-xl max-w-md w-full mx-4"
        style={{ padding: 'var(--spacing-5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-lg font-semibold text-[var(--neutral-900)]"
          style={{ marginBottom: 'var(--spacing-3)' }}
        >
          Adicionar Bookmark
        </h2>
        <p
          className="text-sm text-[var(--neutral-600)]"
          style={{ marginBottom: 'var(--spacing-4)' }}
        >
          Cole a URL da página. O card usará o título e a imagem de preview (Open Graph) quando disponível.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-[var(--neutral-400)] text-[var(--neutral-900)] placeholder:text-[var(--neutral-500)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
            style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}
            autoFocus
            disabled={loading}
          />
          {error && (
            <p
              className="text-sm text-[var(--accent-coral)]"
              style={{ marginTop: 'var(--spacing-2)' }}
            >
              {error}
            </p>
          )}
          <div
            className="flex justify-end"
            style={{ marginTop: 'var(--spacing-5)', gap: 'var(--spacing-3)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg text-[var(--neutral-700)] hover:bg-[var(--neutral-200)] font-medium"
              style={{
                padding: 'var(--spacing-3) var(--spacing-4)',
                minHeight: 40,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-lg bg-[var(--primary-500)] text-[var(--neutral-900)] font-medium disabled:opacity-50"
              style={{
                padding: 'var(--spacing-3) var(--spacing-4)',
                minHeight: 40,
              }}
            >
              {loading ? 'Buscando…' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const { isSignedIn } = useAuth();
  const canEdit = !!isSignedIn;
  const [loaded, setLoaded] = useState(false);

  const addCard = useBoardStore((state) => state.addCard);
  const deleteSelectedCards = useBoardStore((state) => state.deleteSelectedCards);
  const setExitingCards = useBoardStore((state) => state.setExitingCards);
  const cloudEnabled = useBoardStore((state) => state.cloudEnabled);
  const toggleCloud = useBoardStore((state) => state.toggleCloud);
  const hydrate = useBoardStore((state) => state.hydrate);
  const cards = useBoardStore((state) => state.cards);
  const viewport = useBoardStore((state) => state.viewport);
  const setViewport = useBoardStore((state) => state.setViewport);
  const selectedCards = useBoardStore((state) => state.selectedCards);
  const clearSelection = useBoardStore((state) => state.clearSelection);
  const updateCard = useBoardStore((state) => state.updateCard);
  const importInputRef = useRef<HTMLInputElement>(null);

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
        if (cancelled) return;
        hydrate({
          cards: data.cards ?? [],
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

  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const handleBookmarkSubmit = useCallback(
    async (urlInput: string) => {
      const res = await fetch('/api/bookmark-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao buscar preview');
      const topLevelCount = cards.filter((c) => !c.parentId).length;
      let title = data.title;
      if (!title && data.url) {
        try {
          title = new URL(data.url).hostname;
        } catch {
          title = data.url;
        }
      }
      addCard({
        type: 'content',
        title: title || 'Bookmark',
        description: data.description || '',
        image: data.image || '🔗',
        url: data.url,
        position: getOrbitalPosition(topLevelCount, topLevelCount + 1),
      });
    },
    [addCard, cards]
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedCards.length > 0) {
      if (confirm(`Deletar ${selectedCards.length} card(s)?`)) {
        setExitingCards(selectedCards);
        setTimeout(() => {
          deleteSelectedCards();
        }, 380);
      }
    }
  }, [selectedCards, deleteSelectedCards, setExitingCards]);

  const handleResetView = useCallback(() => {}, []);

  const handleExportPositions = useCallback(() => {
    const payload = { cards, viewport, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-positions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cards, viewport]);

  const handleImportPositionsClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportPositionsFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const data = JSON.parse(text) as { cards?: Array<{ id: string; position?: { x: number; y: number } }>; viewport?: { x?: number; y?: number; zoom?: number } };
          const idSet = new Set(cards.map((c) => c.id));
          if (data.cards?.length) {
            data.cards.forEach((item) => {
              if (idSet.has(item.id) && item.position) {
                updateCard(item.id, { position: item.position });
              }
            });
          }
          if (data.viewport && typeof data.viewport === 'object') {
            setViewport(data.viewport);
          }
        } catch {
          alert('Arquivo inválido. Use um JSON exportado por este board.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [cards, updateCard, setViewport]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-50)]">
        <div className="w-8 h-8 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <BookmarkDialog
        open={bookmarkDialogOpen}
        onClose={() => setBookmarkDialogOpen(false)}
        onSubmit={handleBookmarkSubmit}
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        aria-hidden
        onChange={handleImportPositionsFile}
      />

      <Toolbar
        onCreateCard={handleCreateCard}
        onCreateFolder={handleCreateFolder}
        onCreateBookmark={canEdit ? () => setBookmarkDialogOpen(true) : undefined}
        onDeleteSelected={handleDeleteSelected}
        onResetView={handleResetView}
        onToggleCloud={toggleCloud}
        onSave={handleSave}
        onExportPositions={canEdit ? handleExportPositions : undefined}
        onImportPositions={canEdit ? handleImportPositionsClick : undefined}
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
