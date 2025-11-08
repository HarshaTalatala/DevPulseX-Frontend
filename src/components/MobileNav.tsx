'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { Brand } from '@/components/ui/Brand';

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
  onLogout?: () => void;
}

// Accessible mobile slide-over navigation with overlay and focus management
export default function MobileNav({ open, onClose, items, title = 'Menu', user, onLogout }: MobileNavProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Debug: Log items when sidebar opens
  React.useEffect(() => {
    if (open) {
      console.log('MobileNav opened with items:', items);
      console.log('Items length:', items.length);
    }
  }, [open, items]);

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

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-[9999]" 
          aria-live="polite"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          {/* Overlay - Minimal dark with transparency */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Panel - Minimal dark sidebar with transparency */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            ref={panelRef}
            className="absolute inset-y-0 left-0 w-[280px] sm:w-[320px] max-w-[85%] bg-black/90 dark:bg-black/90 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col overflow-hidden"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0 }}
          >
            {/* Header - Minimal style */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 flex-shrink-0">
              <Brand size="md" accent="indigo" interactive={false} asLink={false} />
              <button
                data-close
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation - Minimal style */}
            <nav className="flex-1 overflow-y-auto py-4 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No navigation items
                </div>
              ) : (
                <ul className="px-3 space-y-1">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    const content = (
                      <span className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        item.active
                          ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                      )}>
                        {Icon ? <Icon className="h-5 w-5 flex-shrink-0" /> : null}
                        <span className="flex-1 truncate">{item.label}</span>
                      </span>
                    );

                    return (
                      <li key={`${item.label}-${index}`}>
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
              )}
            </nav>

            {/* User Profile Section at Bottom - Minimal style */}
            {user && (
              <div className="border-t border-white/10 px-4 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 via-purple-500 to-indigo-600 opacity-60 animate-pulse-glow" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name ?? 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.role ?? 'Member'}
                    </p>
                  </div>
                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Logout"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' 
    ? createPortal(content, document.body)
    : null;
}
