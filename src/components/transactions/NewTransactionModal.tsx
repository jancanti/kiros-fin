'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { TransactionType } from '@/types/finance';
import { X, ArrowUpCircle, ArrowDownCircle, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RepetitionType = 'single' | 'fixed' | 'installment';

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const { accounts, creditCards, categories, addTransaction } = useFinanceData();

  // Derive real DB categories (with non-empty IDs)
  const expenseCategories = categories.filter((c) => c.type === 'expense' && c.id);
  const incomeCategories = categories.filter((c) => c.type === 'income' && c.id);

  const [type, setType] = useState<TransactionType>('expense');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [repetitionType, setRepetitionType] = useState<RepetitionType>('single');
  const [repetitionCount, setRepetitionCount] = useState(2);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paid, setPaid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const desc = description.trim();
    const numAmount = parseFloat(amount.replace(',', '.'));

    if (!desc) { setErrorMsg('Informe uma descrição.'); return; }
    if (!numAmount || numAmount <= 0) { setErrorMsg('Informe um valor válido.'); return; }

    // Validate that selected account/card IDs are real UUIDs (not empty string)
    const resolvedAccountId = accountId || null;
    const resolvedCreditCardId = creditCardId || null;
    const resolvedCategoryId = categoryId || null;

    setLoading(true);
    setErrorMsg(null);

    try {
      if (repetitionType === 'installment') {
        const count = Math.max(2, repetitionCount);
        const installmentAmount = numAmount / count;
        // Use crypto.randomUUID() so the group ID is a valid UUID accepted by the DB
        const groupId = crypto.randomUUID();
        const baseDate = new Date(date + 'T12:00:00');

        for (let i = 1; i <= count; i++) {
          const d = new Date(baseDate);
          d.setMonth(d.getMonth() + (i - 1));
          await addTransaction({
            account_id: isCreditCard ? null : resolvedAccountId,
            credit_card_id: isCreditCard ? resolvedCreditCardId : null,
            category_id: resolvedCategoryId,
            destination_account_id: null,
            type,
            amount: Number(installmentAmount.toFixed(2)),
            date: d.toISOString().split('T')[0],
            description: `${desc} (${i}/${count})`,
            paid: i === 1 ? (isCreditCard ? false : paid) : false,
            installment_group_id: groupId,
            current_installment: i,
            total_installments: count,
            recurring_rule_id: null,
          });
        }
      } else if (repetitionType === 'fixed') {
        const count = Math.max(2, repetitionCount);
        // Use crypto.randomUUID() so rule ID is a valid UUID
        const ruleId = crypto.randomUUID();
        const baseDate = new Date(date + 'T12:00:00');

        for (let i = 1; i <= count; i++) {
          const d = new Date(baseDate);
          d.setMonth(d.getMonth() + (i - 1));
          await addTransaction({
            account_id: isCreditCard ? null : resolvedAccountId,
            credit_card_id: isCreditCard ? resolvedCreditCardId : null,
            category_id: resolvedCategoryId,
            destination_account_id: null,
            type,
            amount: numAmount,
            date: d.toISOString().split('T')[0],
            description: desc,
            paid: i === 1 ? (isCreditCard ? false : paid) : false,
            installment_group_id: null,
            current_installment: null,
            total_installments: null,
            recurring_rule_id: ruleId,
          });
        }
      } else {
        await addTransaction({
          account_id: isCreditCard ? null : resolvedAccountId,
          credit_card_id: isCreditCard ? resolvedCreditCardId : null,
          category_id: resolvedCategoryId,
          destination_account_id: null,
          type,
          amount: numAmount,
          date,
          description: desc,
          paid: isCreditCard ? false : paid,
          installment_group_id: null,
          current_installment: null,
          total_installments: null,
          recurring_rule_id: null,
        });
      }

      // Clear state on success
      setDescription('');
      setAmount('');
      setRepetitionType('single');
      setRepetitionCount(2);
      setErrorMsg(null);
      onClose();
    } catch (err: any) {
      console.error('NewTransactionModal submit error:', err);
      setErrorMsg(err?.message || 'Erro ao registrar transação. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nova Transação</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setIsCreditCard(false); }}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
                type === 'expense' && !isCreditCard
                  ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Despesa</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('income'); setIsCreditCard(false); }}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
                type === 'income'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Receita</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('expense'); setIsCreditCard(true); }}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isCreditCard
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cartão</span>
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Valor{repetitionType === 'installment' ? ' Total da Compra' : ''} (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xl font-bold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Repetition selector */}
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/80 dark:border-gray-700/60">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Frequência / Repetição
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['single', 'fixed', 'installment'] as RepetitionType[]).map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setRepetitionType(rt)}
                  className={cn(
                    'py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all',
                    repetitionType === rt
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-bold'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800'
                  )}
                >
                  {rt === 'single' ? 'Única' : rt === 'fixed' ? 'Fixa (Mensal)' : 'Parcelada'}
                </button>
              ))}
            </div>

            {repetitionType !== 'single' && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {repetitionType === 'installment' ? 'Número de Parcelas' : 'Repetir por quantos meses'}
                </label>
                <input
                  type="number"
                  min="2"
                  max="72"
                  required
                  value={repetitionCount}
                  onChange={(e) => setRepetitionCount(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white"
                />
                {amount && Number(amount) > 0 && repetitionType === 'installment' && (
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-1 font-medium">
                    {repetitionCount}x de R$ {(parseFloat(amount) / repetitionCount).toFixed(2)} por mês
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Aluguel, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Date + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Data Inicial</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                <option value="">Sem categoria</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Account / Card */}
          {isCreditCard ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cartão de Crédito</label>
              {creditCards.length === 0 ? (
                <p className="text-xs text-amber-500 py-2">
                  Nenhum cartão cadastrado. Vá em Contas &amp; Cartões para adicionar.
                </p>
              ) : (
                <select
                  value={creditCardId}
                  onChange={(e) => setCreditCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                >
                  <option value="">Selecione um cartão</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>{card.name} (Venc: dia {card.due_day})</option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Conta Bancária</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              >
                <option value="">Nenhuma conta vinculada</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Paid toggle */}
          {!isCreditCard && repetitionType === 'single' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="paid-status"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-sm focus:ring-sky-500"
              />
              <label htmlFor="paid-status" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {type === 'income' ? 'Recebido na conta' : 'Pago / Debitado'}
              </label>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:from-sky-500 hover:to-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Salvando...</span></>
              ) : (
                <span>Confirmar Lançamento</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
