'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { AccountType } from '@/types/finance';
import { X } from 'lucide-react';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAccountModal({ isOpen, onClose }: NewAccountModalProps) {
  const { addAccount } = useFinanceData();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      const balance = parseFloat(initialBalance.replace(',', '.')) || 0;
      await addAccount({
        name,
        type,
        initial_balance: balance,
        current_balance: balance,
        color,
        icon: 'wallet',
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Nova Conta Bancária</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Conta</label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank, Itaú, Carteira..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Conta</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="checking">Conta Corrente</option>
              <option value="savings">Poupança</option>
              <option value="investment">Investimento</option>
              <option value="wallet">Carteira Física</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Saldo Inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
