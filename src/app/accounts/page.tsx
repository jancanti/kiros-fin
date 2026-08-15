'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, CreditCard as CardIcon, Wallet, Edit3, Trash2 } from 'lucide-react';
import { NewAccountModal } from '@/components/accounts/NewAccountModal';
import { NewCreditCardModal } from '@/components/accounts/NewCreditCardModal';
import { EditAccountModal } from '@/components/accounts/EditAccountModal';
import { EditCreditCardModal } from '@/components/accounts/EditCreditCardModal';
import { Account, CreditCard } from '@/types/finance';

export default function AccountsPage() {
  const { accounts, creditCards, transactions } = useFinanceData();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Contas & Cartões
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Gerencie saldos bancários, limites e faturas de cartões de crédito
        </p>
      </div>

      {/* Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-500" />
            <span>Contas Bancárias</span>
          </h2>
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-semibold text-xs hover:bg-sky-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Conta</span>
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 text-xs text-gray-400">
            Nenhuma conta cadastrada ainda. Clique em &quot;Nova Conta&quot; acima para cadastrar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: acc.color || '#3b82f6' }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{acc.name}</h3>
                      <p className="text-[11px] text-gray-400 capitalize">{acc.type}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingAccount(acc)}
                    className="p-1.5 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Editar Conta"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="text-xs text-gray-400">Saldo Atual</span>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {formatCurrency(Number(acc.current_balance))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credit Cards Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CardIcon className="w-5 h-5 text-indigo-500" />
            <span>Cartões de Crédito</span>
          </h2>
          <button
            onClick={() => setIsCardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Cartão</span>
          </button>
        </div>

        {creditCards.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 text-xs text-gray-400">
            Nenhum cartão cadastrado. Clique em &quot;Novo Cartão&quot; acima para adicionar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => {
              const currentMonth = new Date().toISOString().slice(0, 7);
              const cardExpenses = transactions
                .filter((t) => t.credit_card_id === card.id && t.type === 'expense' && t.date.startsWith(currentMonth))
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

              const available = Math.max(0, Number(card.limit_amount) - cardExpenses);
              const usagePercent = Math.min(100, Math.round((cardExpenses / Number(card.limit_amount)) * 100));

              return (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-md space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-wide">{card.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingCard(card)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
                        title="Editar Cartão"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <CardIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400">Fatura Atual (estimada)</span>
                    <p className="text-xl font-bold text-rose-400">{formatCurrency(cardExpenses)}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Limite Usado ({usagePercent}%)</span>
                      <span>Disp: {formatCurrency(available)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-700/60">
                    <span>Fecha dia {card.closing_day}</span>
                    <span>Vence dia {card.due_day}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewAccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />
      <NewCreditCardModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} />

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          isOpen={!!editingAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}

      {editingCard && (
        <EditCreditCardModal
          card={editingCard}
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
