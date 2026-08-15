'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Target, Plus, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onOpenNewTransaction: () => void;
}

export function BottomNav({ onOpenNewTransaction }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Início', icon: LayoutDashboard },
    { href: '/transactions', label: 'Extrato', icon: ArrowLeftRight },
    { href: '/accounts', label: 'Contas', icon: CreditCard },
    { href: '/budgets', label: 'Metas', icon: Target },
    { href: '/import', label: 'Importar', icon: UploadCloud },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 md:hidden px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around relative">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Floating Quick Action Button */}
        <div className="relative -top-5">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Nova Transação"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
