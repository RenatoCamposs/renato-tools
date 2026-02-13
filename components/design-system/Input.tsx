'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full" style={{ marginBottom: 0 }}>
        {label && (
          <label
            className="block text-sm font-medium text-[var(--neutral-700)]"
            style={{ marginBottom: 'var(--spacing-3)' }}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-500)]">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full bg-[var(--neutral-50)] border-2 border-[var(--neutral-300)] rounded-lg text-[var(--neutral-800)]',
              'placeholder:text-[var(--neutral-400)]',
              'transition-all duration-200',
              'focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-200)]',
              error && 'border-[var(--accent-coral)] focus:border-[var(--accent-coral)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}
            aria-invalid={!!error}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-500)]">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-[var(--accent-coral)]" style={{ marginTop: 'var(--spacing-2)' }}>{error}</p>
        )}
        
        {hint && !error && (
          <p className="text-sm text-[var(--neutral-500)]" style={{ marginTop: 'var(--spacing-2)' }}>{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
