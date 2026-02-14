'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ContentCardProps } from '@/lib/types';
import { useBoardStore } from '@/lib/stores/boardStore';

export function ContentCard({ data, selected, isChild = false, isExiting = false, readOnly = false }: ContentCardProps) {
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const selectCard = useBoardStore((state) => state.selectCard);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly && data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!readOnly) selectCard(data.id, e.ctrlKey || e.metaKey);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deletar este card?')) {
      deleteCard(data.id);
    }
  };

  // Resting: não selecionado = borda visível; selecionado = mais escuro. Hover = mesma cor da linha do ícone (primary-300).
  const borderResting = selected ? 'var(--primary-600)' : 'var(--neutral-400)';
  const borderHover = 'var(--primary-300)'; // linha do ícone / conexão
  const shadowRest = `inset 0 0 0 2px ${borderResting}, 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)`;
  const shadowSelected = `inset 0 0 0 2px var(--primary-600), var(--shadow-glow)`;
  const glowShadow = selected ? '0 0 24px rgba(255, 200, 87, 0.5)' : '0 0 30px rgba(255, 217, 120, 0.6)';

  const cardVariants = {
    enter: {
      scale: 0,
      opacity: 0,
    },
    rest: {
      scale: 1,
      opacity: 1,
      y: 0,
      boxShadow: selected ? shadowSelected : shadowRest,
    },
    hover: {
      y: -8,
      scale: 1.05,
      boxShadow: `inset 0 0 0 2px ${borderHover}, ${glowShadow}`,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: {
      scale: 0.98,
      boxShadow: selected ? shadowSelected : shadowRest,
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
  };

  const isEmoji = /\p{Emoji}/u.test(data.image);
  const isUrl = data.image.startsWith('http');
  const isBookmark = isUrl && data.url;

  return (
    <motion.div
      className={cn(
        'relative flex min-w-[200px] w-fit min-h-[100px] flex-col overflow-hidden rounded-xl backdrop-blur-sm transition-all duration-200 cursor-pointer group',
        isChild && 'opacity-95',
        readOnly && data.url && 'cursor-pointer'
      )}
      style={{
        background: data.color || 'var(--card-cream)',
        backgroundColor: data.color ? `${data.color}dd` : 'var(--card-cream)',
        padding: 'var(--spacing-4)',
        boxShadow: selected ? shadowSelected : shadowRest,
      }}
      variants={cardVariants}
      initial="enter"
      animate={isExiting ? 'exit' : 'rest'}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={isExiting ? undefined : 'hover'}
      whileTap={isExiting ? undefined : 'tap'}
      onClick={handleClick}
    >
      {!readOnly && (
        <>
          <Handle type="source" position={Position.Right} id="source" className="!w-2 !h-2 !bg-[var(--primary-500)] !border-2 !border-white opacity-0 hover:opacity-100 transition-opacity" />
          <Handle type="target" position={Position.Left} id="target" className="!w-2 !h-2 !bg-[var(--primary-500)] !border-2 !border-white opacity-0 hover:opacity-100 transition-opacity" />
        </>
      )}

      {/* Bookmark: área de texto maior (imagem 48px), descrição 2 linhas, link até o fim */}
      {isBookmark ? (
        <div className="flex min-w-0 flex-1" style={{ gap: 'var(--spacing-3)' }}>
          <div className="min-w-[140px] max-w-[240px] flex-1 flex flex-col justify-center text-left overflow-hidden" style={{ gap: 'var(--spacing-2)' }}>
            <h3 className="min-w-0 truncate text-sm font-semibold text-[var(--neutral-800)] leading-tight">
              {data.title}
            </h3>
            {data.description ? (
              <p className="line-clamp-2 text-xs leading-tight text-[var(--neutral-600)] break-words min-w-0">
                {data.description}
              </p>
            ) : null}
            {data.url && (
              <p
                className="min-w-0 w-full max-w-full truncate text-[10px] leading-tight text-[var(--primary-600)] whitespace-nowrap"
                style={{ marginTop: 'var(--spacing-2)' }}
                title={data.url}
              >
                {data.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </p>
            )}
          </div>
          <div className="h-[48px] w-[48px] shrink-0 rounded-lg overflow-hidden bg-white/30 shadow-sm">
            <img
              src={data.image}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              sizes="48px"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center shrink-0" style={{ gap: 'var(--spacing-3)' }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/50 shadow-sm">
            {isEmoji ? (
              <div className="text-2xl">{data.image}</div>
            ) : isUrl ? (
              <img
                src={data.image}
                alt={data.title}
                className="h-full w-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
                sizes="48px"
              />
            ) : (
              <div className="text-2xl">{data.image}</div>
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden text-left">
            <h3 className="truncate text-sm font-semibold text-[var(--neutral-800)]" style={{ marginBottom: 'var(--spacing-2)' }}>
              {data.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-tight text-[var(--neutral-600)]">
              {data.description}
            </p>
          </div>
        </div>
      )}

      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap" style={{ marginTop: 'var(--spacing-4)', gap: 'var(--spacing-2)' }}>
          {data.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="rounded-full bg-[var(--primary-200)] font-medium text-[var(--primary-800)]"
              style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--text-xs)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {!readOnly && (
        <motion.button
          className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-coral)] opacity-0 hover:opacity-100 group-hover:opacity-100"
          style={{ top: 'var(--spacing-3)', right: 'var(--spacing-3)' }}
          onClick={handleDelete}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={11} className="text-[var(--neutral-900)]" />
        </motion.button>
      )}

      {data.links && data.links.length > 0 && (
        <div
          className="absolute flex items-center rounded-full bg-[var(--primary-500)] font-bold text-[var(--neutral-900)] shadow-sm"
          style={{
            bottom: 'var(--spacing-3)',
            right: 'var(--spacing-3)',
            padding: 'var(--spacing-1) var(--spacing-2)',
            gap: 'var(--spacing-1)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <LinkIcon size={10} />
          {data.links.length}
        </div>
      )}

      {/* Efeito glow no hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, var(--primary-300), var(--primary-500))',
            filter: 'blur(8px)',
            transform: 'scale(1.1)',
            zIndex: -1,
          }}
        />
      </div>
    </motion.div>
  );
}
