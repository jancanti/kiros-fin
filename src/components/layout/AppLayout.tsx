'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Target, UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="min-h-screen bg-gray-100 dark:bg-gray-950">{children}</main>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
    { href: '/accounts', label: 'Contas & Cartões', icon: CreditCard },
    { href: '/budgets', label: 'Metas & Orçamentos', icon: Target },
    { href: '/import', label: 'Importar Extrato', icon: UploadCloud },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      <Navbar onOpenNewTransaction={() => setIsModalOpen(true)} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-semibold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400')} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      <BottomNav onOpenNewTransaction={() => setIsModalOpen(true)} />

      {isModalOpen && (
        <NewTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
