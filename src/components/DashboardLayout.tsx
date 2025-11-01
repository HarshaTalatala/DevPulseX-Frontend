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
import CommandPalette, { CommandItem } from '@/components/CommandPalette';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Issues', href: '/issues', icon: AlertCircle },
  { name: 'Commits', href: '/commits', icon: GitCommit },
  { name: 'Deployments', href: '/deployments', icon: Rocket },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Users', href: '/users', icon: User },
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

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Primary top bar (Vercel-like) */}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-white/55 supports-[backdrop-filter]:dark:bg-black/40 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)] dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand */}
          <Link href="/dashboard" className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            DevPulseX
          </Link>

          {/* Center search (palette trigger) */}
          <div className="hidden md:flex flex-1 justify-center">
            <button
              onClick={() => setPaletteOpen(true)}
              className="w-full max-w-xl relative flex items-center gap-2 h-9 px-3 rounded-lg ring-1 ring-black/10 dark:ring-white/10 bg-gray-50/60 dark:bg-gray-900/60 text-left text-sm text-gray-500 hover:bg-gray-100/60 dark:hover:bg-gray-900"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 truncate">Search projects, tasks, users…</span>
              <kbd className="hidden lg:inline-flex select-none items-center gap-1 rounded border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-950 px-1.5 font-mono text-[10px] text-gray-600 dark:text-gray-300">Ctrl K</kbd>
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
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden md:flex items-center gap-3 ml-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {(user?.name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-right leading-tight">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{user?.name ?? 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role ?? 'Member'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-red-600"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary nav row (no hard dividers) */}
        <nav>
          <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-auto">
            <ul className="flex items-center gap-1 h-11">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 sm:px-4 h-11 text-sm transition-colors border-b-2',
                        isActive
                          ? 'text-gray-900 dark:text-white border-black dark:border-white'
                          : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
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
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-2 space-y-1 bg-white dark:bg-gray-950">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-2 py-2 rounded-md',
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-red-600"
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
        items={navigation.map<CommandItem>((n) => ({
          id: n.href,
          title: n.name,
          href: n.href,
          icon: n.icon,
        }))}
      />

      {/* Page content (full width) */}
      <main className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
