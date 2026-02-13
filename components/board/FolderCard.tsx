'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { FolderCardProps } from '@/lib/types';
import { useBoardStore, useFolderChildren } from '@/lib/stores/boardStore';
import { ContentCard } from './ContentCard';

export function FolderCard({ data, selected, onToggleExpand, readOnly = false }: FolderCardProps) {
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const childCards = useFolderChildren(data.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(data.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Deletar pasta "${data.title}" e liberar ${childCards.length} cards?`)) {
      deleteCard(data.id);
    }
  };

  // Resting: pasta não selecionada = primary-400; selecionada/expandida = mais escuro. Hover = mesma cor da linha do ícone (primary-300).
  const folderBorderResting = data.isExpanded ? 'var(--primary-700)' : selected ? 'var(--primary-600)' : 'var(--primary-400)';
  const folderBorderHover = 'var(--primary-300)';
  const folderRestShadow = `inset 0 0 0 2px ${folderBorderResting}, 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)`;
  const folderSelectedShadow = `${folderRestShadow}, var(--shadow-glow)`;
  const folderHoverShadow = `inset 0 0 0 2px ${folderBorderHover}, 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06), 0 0 30px rgba(255, 217, 120, 0.6)`;
  const folderExpandedGlow = '0 0 40px rgba(255, 217, 120, 0.8)';

  const folderVariants = {
    enter: {
      scale: 0,
      opacity: 0,
    },
    rest: {
      scale: 1,
      opacity: 1,
      y: 0,
      boxShadow: selected || data.isExpanded ? folderSelectedShadow : folderRestShadow,
    },
    hover: {
      y: -8,
      scale: 1.05,
      boxShadow: folderHoverShadow,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      boxShadow: selected || data.isExpanded ? folderSelectedShadow : folderRestShadow,
    },
    expanded: {
      scale: 1.05,
      boxShadow: `${folderRestShadow}, ${folderExpandedGlow}`,
    }
  };

  const burstVariants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      x: 0,
      y: 0
    },
    visible: (index: number) => {
      const total = childCards.length;
      const angle = (index / total) * Math.PI * 2;
      const radius = 250;
      
      return {
        scale: 1,
        opacity: 1,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
          delay: index * 0.05
        }
      };
    },
    exit: {
      scale: 0,
      opacity: 0,
      x: 0,
      y: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      {/* Card Pasta Principal */}
      <motion.div
        className={cn(
          'relative flex w-[200px] h-[140px] flex-col overflow-visible rounded-xl backdrop-blur-sm transition-all duration-200 cursor-pointer',
          data.isExpanded && 'opacity-90'
        )}
        style={{
          background: data.color || 'var(--primary-200)',
          backgroundColor: data.color ? `${data.color}dd` : 'var(--primary-200)',
          padding: 'var(--spacing-4)',
          // Borda sempre no style para não sumir no modo edição (painel aberto)
          boxShadow: selected || data.isExpanded ? folderSelectedShadow : folderRestShadow,
        }}
        variants={folderVariants}
        initial="enter"
        animate={data.isExpanded ? 'expanded' : 'rest'}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        whileHover="hover"
        whileTap="tap"
        onClick={handleClick}
      >
        {/* Ícone de Pasta */}
        <div 
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-white/50 shadow-sm"
          style={{ marginBottom: 'var(--spacing-3)' }}
        >
          <motion.div
            animate={{ 
              rotate: data.isExpanded ? [0, -10, 10, 0] : 0 
            }}
            transition={{ duration: 0.5 }}
          >
            {data.isExpanded ? (
              <FolderOpen size={32} className="text-[var(--primary-700)]" />
            ) : (
              <Folder size={32} className="text-[var(--primary-700)]" />
            )}
          </motion.div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 text-center">
          <h3 
            className="truncate text-sm font-semibold text-[var(--neutral-800)]"
            style={{ marginBottom: 'var(--spacing-1)' }}
          >
            {data.title}
          </h3>
          <p className="line-clamp-2 text-xs text-[var(--neutral-600)]">
            {data.description}
          </p>
        </div>

        {/* Badge contador */}
        <div 
          className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-600)] text-xs font-bold text-white shadow-md"
          style={{ top: 'var(--spacing-3)', left: 'var(--spacing-3)' }}
        >
          {data.children.length}
        </div>

        {/* Botão Delete - só quando autenticado */}
        {!readOnly && (
          <motion.button
            className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-coral)] opacity-0 transition-opacity hover:opacity-100"
            style={{ top: 'var(--spacing-3)', right: 'var(--spacing-3)' }}
            onClick={handleDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={12} className="text-[var(--neutral-900)]" />
          </motion.button>
        )}

        {/* Indicador expandido */}
        {data.isExpanded && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--primary-600)] rounded-full border-2 border-white shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}

        {/* Efeito pulso quando expandido */}
        {data.isExpanded && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,217,120,0.3) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.div>

      {/* Cards Filhos (quando expandido) */}
      <AnimatePresence>
        {data.isExpanded && (
          <div className="absolute inset-0 pointer-events-none">
            {childCards.map((child, index) => (
              <motion.div
                key={child.id}
                custom={index}
                variants={burstVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-1/2 left-1/2 pointer-events-auto"
                style={{
                  marginLeft: -100, // Centro do card (200px / 2)
                  marginTop: -70,   // Centro do card (140px / 2)
                }}
              >
                <ContentCard 
                  data={child as any} 
                  selected={false}
                  isChild={true}
                />
              </motion.div>
            ))}

            {/* Linhas de Conexão */}
            <svg 
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              style={{ zIndex: -1 }}
            >
              {childCards.map((child, index) => {
                const total = childCards.length;
                const angle = (index / total) * Math.PI * 2;
                const radius = 250;
                const childX = Math.cos(angle) * radius;
                const childY = Math.sin(angle) * radius;

                return (
                  <motion.line
                    key={child.id}
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${childX}px)`}
                    y2={`calc(50% + ${childY}px)`}
                    stroke="var(--primary-300)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  />
                );
              })}
            </svg>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
