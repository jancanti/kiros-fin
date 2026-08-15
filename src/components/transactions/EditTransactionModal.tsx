'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { Transaction } from '@/types/finance';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

type RepetitionType = 'single' | 'fixed' | 'installment';

export function EditTransactionModal({ transaction, isOpen, onClose }: EditTransactionModalProps) {
  const { categories, accounts, creditCards, updateTransaction, transactions } = useFinanceData();

  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [date, setDate] = useState(transaction.date);
  const [categoryId, setCategoryId] = useState(transaction.category_id || '');
  const [accountId, setAccountId] = useState(transaction.account_id || '');
  const [creditCardId, setCreditCardId] = useState(transaction.credit_card_id || '');
  const [paid, setPaid] = useState(transaction.paid);

  // Repetition state
  const initialRepType: RepetitionType = transaction.total_installments
    ? 'installment'
    : transaction.recurring_rule_id
    ? 'fixed'
    : 'single';

  const [repetitionType, setRepetitionType] = useState<RepetitionType>(initialRepType);
  const [repetitionCount, setRepetitionCount] = useState(
    transaction.total_installments || 12
  );
  const [scope, setScope] = useState<'single' | 'future'>('single');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPartOfGroup = !!(transaction.installment_group_id || transaction.recurring_rule_id);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setErrorMsg('Informe uma descrição e um valor válido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const numAmount = parseFloat(amount.replace(',', '.'));

      if (scope === 'future' && isPartOfGroup) {
        if (transaction.installment_group_id) {
          const futureTxs = transactions.filter(
            (t) =>
              t.installment_group_id === transaction.installment_group_id &&
              (t.current_installment || 0) >= (transaction.current_installment || 0)
          );

          for (const item of futureTxs) {
            await updateTransaction(item.id, {
              amount: numAmount,
              category_id: categoryId || null,
              account_id: accountId || null,
              credit_card_id: creditCardId || null,
            });
          }
        } else if (transaction.recurring_rule_id) {
          const futureTxs = transactions.filter(
            (t) => t.recurring_rule_id === transaction.recurring_rule_id && t.date >= transaction.date
          );
          for (const item of futureTxs) {
            await updateTransaction(item.id, {
              description: description.trim(),
              amount: numAmount,
              category_id: categoryId || null,
              account_id: accountId || null,
              credit_card_id: creditCardId || null,
            });
          }
        }
      } else {
        await updateTransaction(transaction.id, {
          description: description.trim(),
          amount: numAmount,
          date,
          category_id: categoryId || null,
          account_id: accountId || null,
          credit_card_id: creditCardId || null,
          paid,
        });
      }

      onClose();
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      setErrorMsg(err?.message || 'Erro ao atualizar lançamento.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.type === (transaction.type === 'income' ? 'income' : 'expense')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Editar Transação</h2>
            <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Repetition indicator & Scope selection */}
          {isPartOfGroup && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {transaction.installment_group_id
                    ? `Parcela ${transaction.current_installment}/${transaction.total_installments}`
                    : 'Despesa Recorrente Fixa'}
                </span>
              </div>
              <div className="space-y-1.5 pt-1 text-xs">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="edit-scope"
                    value="single"
                    checked={scope === 'single'}
                    onChange={() => setScope('single')}
                    className="text-sky-600"
                  />
                  <span>Alterar apenas este lançamento</span>
                </label>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="edit-scope"
                    value="future"
                    checked={scope === 'future'}
                    onChange={() => setScope('future')}
                    className="text-sky-600"
                  />
                  <span>Alterar este e todos os lançamentos futuros</span>
                </label>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                <option value="">Sem categoria</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account or Card */}
          {transaction.credit_card_id ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Cartão de Crédito
              </label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Conta Bancária
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                <option value="">Nenhuma conta vinculada</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Paid checkbox */}
          {!transaction.credit_card_id && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="edit-paid"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-sm"
              />
              <label htmlFor="edit-paid" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Pago / Concluído
              </label>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
