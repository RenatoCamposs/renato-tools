'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { Folder, FolderOpen, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { FolderCardProps } from '@/lib/types';
import { useBoardStore, useFolderChildren } from '@/lib/stores/boardStore';
import { ContentCard } from './ContentCard';

export function FolderCard({ data, selected, onToggleExpand, isExiting = false, readOnly = false }: FolderCardProps) {
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const selectCard = useBoardStore((state) => state.selectCard);
  const childCards = useFolderChildren(data.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(data.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectCard(data.id);
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
      y: 0,
      scale: 1,
      boxShadow: folderHoverShadow,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      boxShadow: selected || data.isExpanded ? folderSelectedShadow : folderRestShadow,
    },
    expanded: {
      scale: 1,
      opacity: 1,
      boxShadow: `${folderRestShadow}, ${folderExpandedGlow}`,
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
  };

  // Pasta orbita o cérebro; filhos aparecem do lado de fora do cérebro (semicírculo na direção oposta ao centro)
  const folderCenterX = (data.position?.x ?? 0) + 100;
  const folderCenterY = (data.position?.y ?? 0) + 70;
  const angleFromHub = Math.atan2(folderCenterY, folderCenterX);
  const burstVariants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      x: 0,
      y: 0
    },
    visible: (index: number) => {
      const total = childCards.length;
      const radius = 250;
      // Semicírculo "para fora" do cérebro: de (angleFromHub - π/2) a (angleFromHub + π/2)
      const angle = angleFromHub - Math.PI / 2 + (index / Math.max(1, total)) * Math.PI;
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
          'relative flex w-[200px] min-h-[100px] flex-col overflow-visible rounded-xl backdrop-blur-sm transition-all duration-200 cursor-pointer group',
          data.isExpanded && 'opacity-90'
        )}
        style={{
          background: data.color || 'var(--primary-200)',
          backgroundColor: data.color ? `${data.color}dd` : 'var(--primary-200)',
          padding: 'var(--spacing-4)',
          boxShadow: selected || data.isExpanded ? folderSelectedShadow : folderRestShadow,
        }}
        variants={folderVariants}
        initial="enter"
        animate={isExiting ? 'exit' : data.isExpanded ? 'expanded' : 'rest'}
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

        {/* Mesma estrutura do card: ícone à esquerda, título + descrição à direita */}
        <div className="flex items-center shrink-0" style={{ gap: 'var(--spacing-3)' }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/50 shadow-sm">
            <motion.div
              animate={{ rotate: data.isExpanded ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              {data.isExpanded ? (
                <FolderOpen size={28} className="text-[var(--primary-700)]" />
              ) : (
                <Folder size={28} className="text-[var(--primary-700)]" />
              )}
            </motion.div>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden text-left">
            <h3
              className="truncate text-sm font-semibold text-[var(--neutral-800)]"
              style={{ marginBottom: 'var(--spacing-2)' }}
            >
              {data.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-tight text-[var(--neutral-600)]">
              {data.description}
            </p>
          </div>
        </div>

        {/* Badge contador (absolute sobre o conteúdo) */}
        <div
          className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary-600)] text-[10px] font-bold text-white shadow-md"
          style={{ bottom: 'var(--spacing-3)', left: 'var(--spacing-3)' }}
        >
          {data.children.length}
        </div>

        {/* Edit + Delete no hover (absolute sobre o conteúdo): lápis ao lado do delete */}
        {!readOnly && (
          <>
            <motion.button
              className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-500)] text-[var(--neutral-900)] opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
              style={{ top: 'var(--spacing-3)', right: 'calc(var(--spacing-3) + 36px)' }}
              onClick={handleEdit}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Editar pasta"
            >
              <Pencil size={14} />
            </motion.button>
            <motion.button
              className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-coral)] text-[var(--neutral-900)] opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
              style={{ top: 'var(--spacing-3)', right: 'var(--spacing-3)' }}
              onClick={handleDelete}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Deletar pasta"
            >
              <Trash2 size={12} />
            </motion.button>
          </>
        )}

        {data.isExpanded && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--primary-600)] rounded-full border-2 border-white shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}

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

      {/* Cards Filhos (quando expandido): ancorados pela borda que enfrenta a pasta, para crescer para fora */}
      <AnimatePresence>
        {data.isExpanded && (
          <div className="absolute inset-0 pointer-events-none">
            {childCards.map((child, index) => {
              const total = childCards.length;
              const angle = angleFromHub - Math.PI / 2 + (index / Math.max(1, total)) * Math.PI;
              const halfW = 100;
              const halfH = 70;
              const outwardX = Math.cos(angle) * halfW;
              const outwardY = Math.sin(angle) * halfH;
              return (
                <motion.div
                  key={child.id}
                  custom={index}
                  variants={burstVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-1/2 left-1/2 pointer-events-auto"
                  style={{
                    marginLeft: -100,
                    marginTop: -70,
                  }}
                >
                  <div
                    style={{
                      transform: `translate(${outwardX}px, ${outwardY}px)`,
                    }}
                  >
                    <ContentCard 
                      data={child as any} 
                      selected={false}
                      isChild={true}
                    />
                  </div>
                </motion.div>
              );
            })}

            {/* Linhas de Conexão: SVG maior que a pasta para incluir o burst (evita linha cortada no topo); centro da pasta em (100,70) = (250,270) no SVG */}
            <svg
              className="absolute pointer-events-none"
              style={{
                zIndex: -1,
                overflow: 'visible',
                left: -150,
                top: -200,
                width: 500,
                height: 520,
              }}
            >
              {childCards.map((child, index) => {
                const total = childCards.length;
                const angle = angleFromHub - Math.PI / 2 + (index / Math.max(1, total)) * Math.PI;
                const radius = 250;
                const childX = Math.cos(angle) * radius;
                const childY = Math.sin(angle) * radius;
                const cx = 250;
                const cy = 270;

                return (
                  <motion.line
                    key={child.id}
                    x1={cx}
                    y1={cy}
                    x2={cx + childX}
                    y2={cy + childY}
                    stroke="var(--primary-400)"
                    strokeWidth="2.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
