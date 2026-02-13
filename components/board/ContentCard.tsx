'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import type { ContentCardProps } from '@/lib/types';
import { useBoardStore } from '@/lib/stores/boardStore';

export function ContentCard({ data, selected, isChild = false, readOnly = false }: ContentCardProps) {
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const selectCard = useBoardStore((state) => state.selectCard);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    }
  };

  const isEmoji = /\p{Emoji}/u.test(data.image);
  const isUrl = data.image.startsWith('http');

  return (
    <motion.div
      className={cn(
        'relative flex w-[200px] h-[140px] flex-col overflow-hidden rounded-xl backdrop-blur-sm transition-all duration-200 cursor-pointer group',
        isChild && 'opacity-95'
      )}
      style={{
        background: data.color || 'var(--card-cream)',
        backgroundColor: data.color ? `${data.color}dd` : 'var(--card-cream)',
        padding: 'var(--spacing-4)',
        // Borda sempre no style para não sumir no modo edição (painel aberto)
        boxShadow: selected ? shadowSelected : shadowRest,
      }}
      variants={cardVariants}
      initial="enter"
      animate="rest"
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
    >
      {/* Handles para conexões - só quando pode editar */}
      {!readOnly && (
        <>
          <Handle 
            type="source" 
            position={Position.Right} 
            className="!w-2 !h-2 !bg-[var(--primary-500)] !border-2 !border-white opacity-0 hover:opacity-100 transition-opacity"
          />
          <Handle 
            type="target" 
            position={Position.Left} 
            className="!w-2 !h-2 !bg-[var(--primary-500)] !border-2 !border-white opacity-0 hover:opacity-100 transition-opacity"
          />
        </>
      )}

      {/* Grupo imagem + texto alinhados horizontalmente */}
      <div 
        className="flex flex-1 min-h-0 items-center"
        style={{ gap: 'var(--spacing-3)' }}
      >
        <div 
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/50 shadow-sm"
        >
          {isEmoji ? (
            <div className="text-2xl">{data.image}</div>
          ) : isUrl ? (
            <Image 
              src={data.image} 
              alt={data.title}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-2xl">{data.image}</div>
          )}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden text-left">
          <h3 
            className="truncate text-sm font-semibold text-[var(--neutral-800)]"
            style={{ marginBottom: 'var(--spacing-1)' }}
          >
            {data.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-tight text-[var(--neutral-600)]">
            {data.description}
          </p>
        </div>
      </div>

      {/* Tags (chips) */}
      {data.tags && data.tags.length > 0 && (
        <div 
          className="flex flex-wrap"
          style={{ marginTop: 'var(--spacing-4)', gap: 'var(--spacing-2)' }}
        >
          {data.tags.slice(0, 2).map(tag => (
            <span 
              key={tag} 
              className="rounded-full bg-[var(--primary-200)] font-medium text-[var(--primary-800)]"
              style={{ 
                padding: 'var(--spacing-1) var(--spacing-2)',
                fontSize: 'var(--text-xs)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Botão Delete - só quando autenticado */}
      {!readOnly && (
        <motion.button
          className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-coral)] opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
          style={{ top: 'var(--spacing-3)', right: 'var(--spacing-3)' }}
          onClick={handleDelete}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={12} className="text-[var(--neutral-900)]" />
        </motion.button>
      )}

      {/* Badge de conexões */}
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
