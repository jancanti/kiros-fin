'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Wallet,
  Repeat,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';
import { Transaction } from '@/types/finance';

export default function TransactionsPage() {
  const { transactions, categories, accounts, creditCards, deleteTransaction, updateTransaction } =
    useFinanceData();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || tx.category_id === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const togglePaid = (id: string, currentPaid: boolean) => {
    updateTransaction(id, { paid: !currentPaid });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Extrato & Transações
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Gerencie, edite valores e filtre seus lançamentos
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900 p-3.5 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="transfer">Transferências</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Nenhuma transação encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.category_id);
            const acc = accounts.find((a) => a.id === tx.account_id);
            const card = creditCards.find((c) => c.id === tx.credit_card_id);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => togglePaid(tx.id, tx.paid)}
                    title={tx.paid ? 'Marcado como pago' : 'Marcar como pago'}
                    className="shrink-0 text-gray-400 hover:text-sky-500 transition-colors"
                  >
                    {tx.paid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {tx.description}
                      </p>

                      {/* Repetition Tags */}
                      {tx.recurring_rule_id && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                          <Repeat className="w-2.5 h-2.5" />
                          Fixa
                        </span>
                      )}

                      {tx.total_installments && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          <Layers className="w-2.5 h-2.5" />
                          {tx.current_installment}/{tx.total_installments}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap mt-0.5">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span>{cat?.name || 'Sem Categoria'}</span>
                      {card && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-indigo-500 dark:text-indigo-400 font-medium">
                            <CreditCard className="w-3 h-3" />
                            {card.name}
                          </span>
                        </>
                      )}
                      {acc && !card && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-gray-600 dark:text-gray-400 font-medium">
                            <Wallet className="w-3 h-3" />
                            {acc.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-sm sm:text-base font-bold',
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'
                      )}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                    </span>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingTx(tx)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Editar Lançamento"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir este lançamento?')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          isOpen={!!editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
