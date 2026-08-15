'use client';

import React from 'react';
import Link from 'next/link';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, ArrowRight, CreditCard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RecentTransactions() {
  const { transactions, categories, accounts, creditCards } = useFinanceData();

  const recent = transactions.slice(0, 5);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Últimos Lançamentos</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Atividades recentes registradas</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {recent.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">Nenhuma transação encontrada</div>
        ) : (
          recent.map((tx) => {
            const cat = categories.find((c) => c.id === tx.category_id);
            const acc = accounts.find((a) => a.id === tx.account_id);
            const card = creditCards.find((c) => c.id === tx.credit_card_id);

            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 px-1 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white',
                      isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                    )}
                    style={cat?.color ? { backgroundColor: cat.color } : {}}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">{cat?.name || 'Sem Categoria'}</span>
                      {card && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-indigo-500 dark:text-indigo-400">
                            <CreditCard className="w-3 h-3" />
                            {card.name}
                          </span>
                        </>
                      )}
                      {acc && !card && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
                            <Wallet className="w-3 h-3" />
                            {acc.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={cn(
                      'text-sm sm:text-base font-bold',
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'
                    )}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                  </span>
                  {tx.total_installments && (
                    <p className="text-[10px] text-gray-400">
                      Parcela {tx.current_installment}/{tx.total_installments}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
