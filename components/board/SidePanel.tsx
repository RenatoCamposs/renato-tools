'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Input } from '@/components/design-system/Input';
import { useBoardStore } from '@/lib/stores/boardStore';
import type { Card, ContentCard } from '@/lib/types';
import { CARD_COLORS, CARD_EMOJIS } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

const COLOR_OPTIONS = [
  { key: 'cream', label: 'Creme', value: CARD_COLORS.cream },
  { key: 'yellow', label: 'Amarelo', value: CARD_COLORS.yellow },
  { key: 'honey', label: 'Mel', value: CARD_COLORS.honey },
  { key: 'peach', label: 'Pêssego', value: CARD_COLORS.peach },
  { key: 'mint', label: 'Menta', value: CARD_COLORS.mint },
  { key: 'lavender', label: 'Lavanda', value: CARD_COLORS.lavender },
  { key: 'sky', label: 'Céu', value: CARD_COLORS.sky },
] as const;

export interface SidePanelProps {
  card: Card | null;
  onClose: () => void;
  readOnly?: boolean;
}

export function SidePanel({ card, onClose, readOnly = false }: SidePanelProps) {
  const updateCard = useBoardStore((state) => state.updateCard);
  const clearSelection = useBoardStore((state) => state.clearSelection);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [color, setColor] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    if (!card) return;
    setTitle(card.title);
    setDescription(card.description);
    setImage(card.image);
    setColor(card.color);
    if (card.type === 'content') {
      const c = card as ContentCard;
      setTagsStr((c.tags ?? []).join(', '));
    }
  }, [card]);

  const applyUpdate = (updates: Partial<Card>) => {
    if (!card) return;
    updateCard(card.id, updates);
  };

  const handleTitleBlur = () => {
    if (title.trim() !== card?.title) applyUpdate({ title: title.trim() || (card?.title ?? '') });
  };
  const handleDescriptionBlur = () => {
    if (description !== card?.description) applyUpdate({ description });
  };
  const handleImageBlur = () => {
    if (image !== card?.image) applyUpdate({ image: image || (card?.image ?? '📝') });
  };
  const handleColorChange = (c: string) => {
    setColor(c);
    applyUpdate({ color: c });
  };
  const handleTagsBlur = () => {
    if (card?.type !== 'content') return;
    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    const current = (card as ContentCard).tags ?? [];
    if (JSON.stringify(tags) !== JSON.stringify(current)) {
      applyUpdate({ tags } as Partial<ContentCard>);
    }
  };

  const handleClose = () => {
    clearSelection();
    onClose();
  };

  if (!card) return null;

  const isContent = card.type === 'content';

  return (
    <motion.div
        className="fixed inset-y-0 right-0 w-full max-w-md z-[var(--z-modal)] flex flex-col bg-[var(--neutral-50)] shadow-2xl"
        style={{
          boxShadow: 'inset 1px 0 0 var(--neutral-300), -20px 0 40px rgba(0,0,0,0.08)',
        }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: 'var(--spacing-5)',
            borderBottom: '1px solid var(--neutral-200)',
          }}
        >
          <h2 className="text-lg font-semibold text-[var(--neutral-800)]">
            {isContent ? 'Editar card' : 'Editar pasta'}
          </h2>
          {!readOnly && (
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 text-[var(--neutral-500)] hover:bg-[var(--neutral-200)] hover:text-[var(--neutral-800)] transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Form */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{
            padding: 'var(--spacing-5) var(--spacing-5) var(--spacing-8)',
          }}
        >
          <div className="flex flex-col" style={{ gap: 'var(--spacing-6)' }}>
            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Título do card"
              disabled={readOnly}
            />
            <div className="w-full">
              <label
                className="block text-sm font-medium text-[var(--neutral-700)]"
                style={{ marginBottom: 'var(--spacing-3)' }}
              >
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Descrição..."
                disabled={readOnly}
                rows={3}
                className={cn(
                  'w-full bg-[var(--neutral-50)] rounded-lg text-[var(--neutral-800)]',
                  'placeholder:text-[var(--neutral-400)] border-2 border-[var(--neutral-300)]',
                  'focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-200)]',
                  'resize-y min-h-[80px]'
                )}
                style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}
              />
            </div>
            <Input
              label="Ícone (emoji ou URL)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              onBlur={handleImageBlur}
              placeholder="📝 ou https://..."
              disabled={readOnly}
            />
            {/* Picker rápido de emojis */}
            {!readOnly && (
              <div className="flex flex-wrap" style={{ gap: 'var(--spacing-3)' }}>
                {CARD_EMOJIS.slice(0, 12).map((emoji, index) => (
                  <button
                    key={`emoji-${index}`}
                    type="button"
                    onClick={() => {
                      setImage(emoji);
                      applyUpdate({ image: emoji });
                    }}
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors',
                      image === emoji
                        ? 'bg-[var(--primary-500)] text-[var(--neutral-900)]'
                        : 'bg-[var(--neutral-200)] text-[var(--neutral-700)] hover:bg-[var(--primary-200)]'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className="w-full">
              <span
                className="block text-sm font-medium text-[var(--neutral-700)]"
                style={{ marginBottom: 'var(--spacing-3)' }}
              >
                Cor do card
              </span>
              <div className="flex flex-wrap" style={{ gap: 'var(--spacing-3)' }}>
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleColorChange(opt.value)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-transform',
                      color === opt.value
                        ? 'border-[var(--neutral-800)] scale-110'
                        : 'border-[var(--neutral-300)] hover:scale-105'
                    )}
                    style={{ backgroundColor: opt.value }}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>
            {isContent && (
              <div className="w-full">
                <label
                  className="block text-sm font-medium text-[var(--neutral-700)]"
                  style={{ marginBottom: 'var(--spacing-3)' }}
                >
                  Tags (separadas por vírgula)
                </label>
                <input
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  onBlur={handleTagsBlur}
                  placeholder="tag1, tag2"
                  disabled={readOnly}
                  className={cn(
                    'w-full bg-[var(--neutral-50)] border-2 border-[var(--neutral-300)] rounded-lg',
                    'text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)]',
                    'focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-200)]'
                  )}
                  style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
  );
}
