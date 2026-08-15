'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { X } from 'lucide-react';

interface NewCreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCreditCardModal({ isOpen, onClose }: NewCreditCardModalProps) {
  const { addCreditCard } = useFinanceData();
  const [name, setName] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [closingDay, setClosingDay] = useState(25);
  const [dueDay, setDueDay] = useState(5);
  const [color, setColor] = useState('#8b5cf6');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limitAmount) return;

    setLoading(true);
    try {
      const limit = parseFloat(limitAmount.replace(',', '.')) || 0;
      await addCreditCard({
        name,
        limit_amount: limit,
        closing_day: Number(closingDay),
        due_day: Number(dueDay),
        color,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Novo Cartão de Crédito</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Cartão</label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank Mastercard, XP Visa..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Limite Total (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ex: 5000,00"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Dia do Fechamento</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Dia do Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
