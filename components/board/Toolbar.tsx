'use client';

import { motion } from 'framer-motion';
import { Plus, Folder, Trash2, Maximize2, Cloud, CloudOff, Save } from 'lucide-react';
import { Tooltip } from '@/components/design-system/Tooltip';
import { cn } from '@/lib/utils/cn';
import type { ToolbarProps } from '@/lib/types';

export function Toolbar({
  onCreateCard,
  onCreateFolder,
  onDeleteSelected,
  onResetView,
  onToggleCloud,
  onSave,
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
      <div 
        className="flex items-center rounded-2xl bg-[var(--neutral-50)] backdrop-blur-md"
        style={{ 
          padding: 'var(--spacing-2) var(--spacing-3)',
          gap: 'var(--spacing-3)',
          boxShadow: 'inset 0 0 0 2px var(--neutral-400), 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)',
        }}
      >
        {canEdit && (
          <>
            <Tooltip content="Criar Card">
              <motion.button
                onClick={onCreateCard}
                className="rounded-lg hover:bg-[var(--primary-100)] text-[var(--neutral-700)] hover:text-[var(--primary-800)] transition-colors"
                style={{ padding: 'var(--spacing-2)', minWidth: 40, minHeight: 40 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus size={20} />
              </motion.button>
            </Tooltip>

            <Tooltip content="Criar Pasta">
              <motion.button
                onClick={onCreateFolder}
                className="rounded-lg hover:bg-[var(--primary-100)] text-[var(--neutral-700)] hover:text-[var(--primary-800)] transition-colors"
                style={{ padding: 'var(--spacing-2)', minWidth: 40, minHeight: 40 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Folder size={20} />
              </motion.button>
            </Tooltip>

            <div 
              className="bg-[var(--neutral-300)]" 
              style={{ width: 1, height: 24, flexShrink: 0 }} 
            />

            <Tooltip content="Deletar Selecionados (Delete)">
              <motion.button
                onClick={onDeleteSelected}
                disabled={!hasSelection}
                className={cn(
                  'rounded-lg transition-colors',
                  hasSelection
                    ? 'hover:bg-[var(--accent-coral)] text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
                    : 'opacity-30 cursor-not-allowed text-[var(--neutral-400)]'
                )}
                style={{ padding: 'var(--spacing-2)', minWidth: 40, minHeight: 40 }}
                whileHover={hasSelection ? { scale: 1.1 } : {}}
                whileTap={hasSelection ? { scale: 0.9 } : {}}
              >
                <Trash2 size={20} />
              </motion.button>
            </Tooltip>

            <div 
              className="bg-[var(--neutral-300)]" 
              style={{ width: 1, height: 24, flexShrink: 0 }} 
            />
          </>
        )}

        <Tooltip content="Resetar Visualização">
          <motion.button
            onClick={onResetView}
            className="rounded-lg hover:bg-[var(--primary-100)] text-[var(--neutral-700)] hover:text-[var(--primary-800)] transition-colors"
            style={{ padding: 'var(--spacing-2)', minWidth: 40, minHeight: 40 }}
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
              'rounded-lg transition-colors',
              cloudEnabled
                ? 'bg-[var(--primary-200)] text-[var(--primary-800)]'
                : 'hover:bg-[var(--neutral-200)] text-[var(--neutral-700)]'
            )}
            style={{ padding: 'var(--spacing-2)', minWidth: 40, minHeight: 40 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {cloudEnabled ? <Cloud size={20} /> : <CloudOff size={20} />}
          </motion.button>
        </Tooltip>

        {canEdit && onSave && (
          <>
            <div className="bg-[var(--neutral-300)]" style={{ width: 1, height: 24, flexShrink: 0 }} />
            <Tooltip content="Salvar (visível para todos)">
              <motion.button
                onClick={onSave}
                className="rounded-lg bg-[var(--primary-500)] text-[var(--neutral-900)] font-medium hover:bg-[var(--primary-600)] transition-colors"
                style={{ padding: 'var(--spacing-2) var(--spacing-3)', minHeight: 40 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                <Save size={18} />
                Salvar
              </span>
              </motion.button>
            </Tooltip>
          </>
        )}
      </div>
    </motion.div>
  );
}
