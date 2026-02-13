'use client';

import { motion } from 'framer-motion';
import { Plus, Folder, Trash2, Maximize2, Cloud, CloudOff } from 'lucide-react';
import { Tooltip } from '@/components/design-system/Tooltip';
import { cn } from '@/lib/utils/cn';
import type { ToolbarProps } from '@/lib/types';

export function Toolbar({
  onCreateCard,
  onCreateFolder,
  onDeleteSelected,
  onResetView,
  onToggleCloud,
  hasSelection,
  cloudEnabled,
  canEdit = false,
}: ToolbarProps) {
  return (
    <motion.div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[var(--z-fixed)]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-2 bg-[var(--neutral-50)] border-2 border-[var(--neutral-300)] rounded-2xl px-3 py-2 shadow-xl backdrop-blur-md">
        {canEdit && (
          <>
            <Tooltip content="Criar Card">
              <motion.button
                onClick={onCreateCard}
                className="p-2 rounded-lg hover:bg-[var(--primary-100)] text-[var(--neutral-700)] hover:text-[var(--primary-800)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus size={20} />
              </motion.button>
            </Tooltip>

            <Tooltip content="Criar Pasta">
              <motion.button
                onClick={onCreateFolder}
                className="p-2 rounded-lg hover:bg-[var(--primary-100)] text-[var(--neutral-700)] hover:text-[var(--primary-800)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Folder size={20} />
              </motion.button>
            </Tooltip>

            <div className="w-px h-6 bg-[var(--neutral-300)]" />

            <Tooltip content="Deletar Selecionados (Delete)">
              <motion.button
                onClick={onDeleteSelected}
                disabled={!hasSelection}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  hasSelection
                    ? 'hover:bg-[var(--accent-coral)] text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
                    : 'opacity-30 cursor-not-allowed text-[var(--neutral-400)]'
                )}
                whileHover={hasSelection ? { scale: 1.1 } : {}}
                whileTap={hasSelection ? { scale: 0.9 } : {}}
              >
                <Trash2 size={20} />
              </motion.button>
            </Tooltip>

            <div className="w-px h-6 bg-[var(--neutral-300)]" />
          </>
        )}

        <Tooltip content="Resetar Visualização">
          <motion.button
            onClick={onResetView}
            className="p-2 rounded-lg hover:bg-[var(--primary-100)] text-[var(--neutral-700)] hover:text-[var(--primary-800)] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Maximize2 size={20} />
          </motion.button>
        </Tooltip>

        <Tooltip content={cloudEnabled ? 'Desativar Nuvem' : 'Ativar Nuvem'}>
          <motion.button
            onClick={onToggleCloud}
            className={cn(
              'p-2 rounded-lg transition-colors',
              cloudEnabled
                ? 'bg-[var(--primary-200)] text-[var(--primary-800)]'
                : 'hover:bg-[var(--neutral-200)] text-[var(--neutral-700)]'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {cloudEnabled ? <Cloud size={20} /> : <CloudOff size={20} />}
          </motion.button>
        </Tooltip>
      </div>
    </motion.div>
  );
}
