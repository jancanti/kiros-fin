'use client';

import React from 'react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { CategoryExpenseChart } from '@/components/dashboard/CategoryExpenseChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { loading, refreshData } = useFinanceData();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Visão Geral
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Acompanhe seu saldo, receitas e despesas em tempo real
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Atualizar dados"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Cards Row */}
      <SummaryCards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryExpenseChart />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
