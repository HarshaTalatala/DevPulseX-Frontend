'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  GitCommit,
  Rocket,
  Users,
  User,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Brand } from '@/components/ui/Brand';
import CommandPalette, { CommandItem } from '@/components/CommandPalette';
import { Role } from '@/types';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Issues', href: '/issues', icon: AlertCircle },
  { name: 'Commits', href: '/commits', icon: GitCommit },
  { name: 'Deployments', href: '/deployments', icon: Rocket },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Users', href: '/users', icon: User, roles: [Role.ADMIN, Role.MANAGER] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Top nav menu for mobile
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const logout = useLogout();
  const [isMac, setIsMac] = useState(false);
  React.useEffect(() => {
    try {
      setIsMac(navigator.platform.toUpperCase().includes('MAC'));
    } catch {
      setIsMac(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Primary top bar (Vercel-like) */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-black/40 border-b border-gray-200/50 dark:border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand */}
          <Brand size="md" accent="indigo" interactive />

          {/* Center search (palette trigger) */}
          <div className="hidden md:flex flex-1 justify-center">
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Open search"
              className="w-full max-w-md relative flex items-center gap-2 h-8 px-3 rounded-md border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-left text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-neutral-600 transition-colors shadow-sm"
            >
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="flex-1 truncate">Search…</span>
              <kbd className="hidden lg:inline-flex select-none items-center gap-0.5 rounded bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-600 dark:text-gray-400">{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
            </button>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setNewOpen((v) => !v)}
                onBlur={() => setTimeout(() => setNewOpen(false), 150)}
              >
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
              {newOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg">
                  <div className="py-1 text-sm">
                    <Link href="/projects" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900">Project</Link>
                    <Link href="/tasks" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900">Task</Link>
                    <Link href="/issues" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900">Issue</Link>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden md:flex items-center gap-2 ml-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {(user?.name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-right leading-tight">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{user?.name ?? 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role ?? 'Member'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary nav row */}
        <nav>
          <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-auto">
            <ul className="flex items-center gap-0 h-12">
              {navigation
                .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)))
                .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 sm:px-4 h-12 text-sm font-medium transition-colors border-b-2 -mb-px',
                        isActive
                          ? 'text-gray-900 dark:text-white border-gray-900 dark:border-white'
                          : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="whitespace-nowrap">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile dropdown nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-neutral-800">
            <div className="px-4 py-2 space-y-1 bg-white dark:bg-black">
              {navigation
                .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)))
                .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
                      isActive
                        ? 'bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900'
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-neutral-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        setOpen={setPaletteOpen}
        items={navigation
          .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)))
          .map<CommandItem>((n) => ({
          id: n.href,
          title: n.name,
          href: n.href,
          icon: n.icon,
        }))}
      />

      {/* Page content (full width) */}
      <main className="py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
