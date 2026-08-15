'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { CreditCard } from '@/types/finance';
import { X, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';

interface EditCreditCardModalProps {
  card: CreditCard;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCreditCardModal({ card, isOpen, onClose }: EditCreditCardModalProps) {
  const { updateCreditCard, deleteCreditCard } = useFinanceData();
  const [name, setName] = useState(card.name);
  const [limitAmount, setLimitAmount] = useState(String(card.limit_amount));
  const [closingDay, setClosingDay] = useState(card.closing_day);
  const [dueDay, setDueDay] = useState(card.due_day);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !limitAmount) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const limit = parseFloat(limitAmount.replace(',', '.')) || 0;
      await updateCreditCard(card.id, {
        name: name.trim(),
        limit_amount: limit,
        closing_day: Number(closingDay),
        due_day: Number(dueDay),
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Erro ao atualizar cartão.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Deseja realmente excluir o cartão "${card.name}"?`)) return;
    setLoading(true);
    try {
      await deleteCreditCard(card.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao excluir cartão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Editar Cartão de Crédito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Nome do Cartão</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Limite Total (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Dia do Fechamento</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Dia do Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
