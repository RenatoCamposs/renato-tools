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

  const cardVariants = {
    hover: {
      y: -8,
      scale: 1.05,
      boxShadow: '0 0 30px rgba(255, 217, 120, 0.6)',
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: {
      scale: 0.98
    }
  };

  const isEmoji = /\p{Emoji}/u.test(data.image);
  const isUrl = data.image.startsWith('http');

  return (
    <motion.div
      className={cn(
        'relative w-[200px] h-[140px] rounded-xl p-3',
        'border-2 shadow-md cursor-pointer',
        'backdrop-blur-sm transition-all duration-200',
        'flex flex-col overflow-hidden',
        selected 
          ? 'border-[var(--primary-500)] shadow-glow' 
          : 'border-[var(--neutral-300)]',
        isChild && 'opacity-95'
      )}
      style={{
        background: data.color || 'var(--card-cream)',
        backgroundColor: data.color ? `${data.color}dd` : 'var(--card-cream)',
      }}
      variants={cardVariants}
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

      {/* Imagem/Ícone */}
      <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-white/50 flex items-center justify-center overflow-hidden shadow-sm">
        {isEmoji ? (
          <div className="text-3xl">{data.image}</div>
        ) : isUrl ? (
          <Image 
            src={data.image} 
            alt={data.title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-3xl">{data.image}</div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 text-center overflow-hidden">
        <h3 className="text-sm font-semibold text-[var(--neutral-800)] mb-1 truncate">
          {data.title}
        </h3>
        <p className="text-xs text-[var(--neutral-600)] line-clamp-2 leading-tight">
          {data.description}
        </p>
      </div>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {data.tags.slice(0, 2).map(tag => (
            <span 
              key={tag} 
              className="text-[10px] px-2 py-0.5 bg-[var(--primary-200)] text-[var(--primary-800)] rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Botão Delete - só quando autenticado */}
      {!readOnly && (
        <motion.button
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--accent-coral)] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10"
          onClick={handleDelete}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={12} className="text-[var(--neutral-900)]" />
        </motion.button>
      )}

      {/* Badge de conexões */}
      {data.links && data.links.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-[var(--primary-500)] text-[var(--neutral-900)] rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
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
