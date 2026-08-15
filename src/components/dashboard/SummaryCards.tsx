'use client';

import React from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

export function SummaryCards() {
  const { accounts, creditCards, transactions } = useFinanceData();

  // Calculate totals
  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.current_balance || 0), 0);

  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const monthExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const creditCardBills = monthTransactions
    .filter((t) => t.credit_card_id !== null && t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const cards = [
    {
      title: 'Saldo Geral em Contas',
      amount: totalBalance,
      icon: Wallet,
      iconColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400',
      textColor: 'text-gray-900 dark:text-white',
    },
    {
      title: 'Receitas no Mês',
      amount: monthIncome,
      icon: TrendingUp,
      iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Despesas no Mês',
      amount: monthExpense,
      icon: TrendingDown,
      iconColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
      textColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Faturas de Cartão',
      amount: creditCardBills,
      icon: CreditCard,
      iconColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-base sm:text-xl font-bold tracking-tight ${card.textColor}`}>
              {formatCurrency(card.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
