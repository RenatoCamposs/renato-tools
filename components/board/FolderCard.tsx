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

  const folderVariants = {
    hover: {
      y: -8,
      scale: 1.05,
      boxShadow: '0 0 30px rgba(255, 217, 120, 0.6)',
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    },
    expanded: {
      scale: 1.05,
      boxShadow: '0 0 40px rgba(255, 217, 120, 0.8)',
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
          'relative w-[200px] h-[140px] rounded-xl p-3',
          'border-2 shadow-md cursor-pointer',
          'backdrop-blur-sm transition-all duration-200',
          'flex flex-col overflow-visible',
          selected 
            ? 'border-[var(--primary-600)] shadow-glow' 
            : 'border-[var(--primary-400)]',
          data.isExpanded && 'border-[var(--primary-700)] opacity-90'
        )}
        style={{
          background: data.color || 'var(--primary-200)',
          backgroundColor: data.color ? `${data.color}dd` : 'var(--primary-200)',
        }}
        variants={folderVariants}
        whileHover="hover"
        whileTap="tap"
        animate={data.isExpanded ? 'expanded' : undefined}
        onClick={handleClick}
      >
        {/* Ícone de Pasta */}
        <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-white/50 flex items-center justify-center shadow-sm">
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
          <h3 className="text-sm font-semibold text-[var(--neutral-800)] mb-1 truncate">
            {data.title}
          </h3>
          <p className="text-xs text-[var(--neutral-600)] line-clamp-2">
            {data.description}
          </p>
        </div>

        {/* Badge contador */}
        <div className="absolute top-2 left-2 bg-[var(--primary-600)] text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-md">
          {data.children.length}
        </div>

        {/* Botão Delete - só quando autenticado */}
        {!readOnly && (
          <motion.button
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--accent-coral)] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
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
