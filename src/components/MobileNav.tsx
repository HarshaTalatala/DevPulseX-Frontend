'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MobileNavItem = {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  active?: boolean;
};

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  items: MobileNavItem[];
  title?: string;
  user?: {
    name?: string;
    role?: string;
  };
}

// Accessible mobile slide-over navigation with overlay and focus management
export default function MobileNav({ open, onClose, items, title = 'Menu', user }: MobileNavProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Focus the close button on open
  React.useEffect(() => {
    if (open) {
      const btn = panelRef.current?.querySelector<HTMLButtonElement>('button[data-close]');
      btn?.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="md:hidden" aria-live="polite">
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            ref={panelRef}
            className="fixed inset-y-0 left-0 z-[70] w-80 max-w-[85%] bg-white dark:bg-black border-r border-gray-200 dark:border-neutral-800 shadow-xl flex flex-col"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-neutral-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
              <button
                data-close
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Profile Section */}
            {user && (
              <div className="px-4 py-4 border-b border-gray-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {(user.name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name ?? 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.role ?? 'Member'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-2">
              <ul className="px-2 space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <span className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                      item.active
                        ? 'bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900'
                    )}>
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      {item.label}
                    </span>
                  );

                  return (
                    <li key={item.label}>
                      {item.href ? (
                        <Link href={item.href} onClick={onClose} className="block">
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            item.onClick?.();
                            onClose();
                          }}
                          className="w-full text-left"
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
