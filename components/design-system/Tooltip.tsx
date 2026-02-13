'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  let timeout: NodeJS.Timeout;

  const showTooltip = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-[var(--spacing-2)]',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-[var(--spacing-2)]',
    left: 'right-full top-1/2 -translate-y-1/2 mr-[var(--spacing-2)]',
    right: 'left-full top-1/2 -translate-y-1/2 ml-[var(--spacing-2)]',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--neutral-900)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--neutral-900)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--neutral-900)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--neutral-900)]',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'absolute z-[var(--z-tooltip)] pointer-events-none',
              placementClasses[placement]
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <div
              className="relative bg-[var(--neutral-900)] text-[var(--neutral-50)] rounded-lg text-sm whitespace-nowrap shadow-lg"
              style={{ padding: 'var(--spacing-2) var(--spacing-3)' }}
            >
              {content}
              
              {/* Arrow */}
              <div
                className={cn(
                  'absolute w-0 h-0 border-4 border-transparent',
                  arrowClasses[placement]
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
