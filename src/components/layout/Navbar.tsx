'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sparkles, LogOut, Plus, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  onOpenNewTransaction: () => void;
}

export function Navbar({ onOpenNewTransaction }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Kiros<span className="text-sky-500 font-extrabold">Fin</span>
            </span>
          </Link>
        </div>

        {/* Action button & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar Tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Transação</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium text-xs">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
