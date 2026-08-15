'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Target, AlertTriangle, CheckCircle2, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BudgetsPage() {
  const { budgets, categories, transactions, addBudget, deleteBudget } = useFinanceData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !plannedAmount) return;

    setLoading(true);
    try {
      await addBudget({
        category_id: categoryId,
        month_year: currentMonth,
        planned_amount: parseFloat(plannedAmount.replace(',', '.')),
      });
      setIsModalOpen(false);
      setPlannedAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Metas & Orçamentos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Defina limites de gastos por categoria para o mês atual
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Nenhum orçamento definido</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Crie metas mensais por categoria para controlar despesas e evitar gastos excessivos.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500"
          >
            Criar meu primeiro orçamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const cat = categories.find((c) => c.id === budget.category_id);
            const spent = transactions
              .filter((t) => t.category_id === budget.category_id && t.type === 'expense' && t.date.startsWith(currentMonth))
              .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const planned = Number(budget.planned_amount);
            const percentage = Math.min(100, Math.round((spent / planned) * 100));
            const isExceeded = spent > planned;

            return (
              <div
                key={budget.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat?.color || '#3b82f6' }}
                    />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {cat?.name || 'Categoria'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExceeded ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Excedido
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        No limite
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir esta meta?')) {
                          deleteBudget(budget.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-gray-400">Gasto Atual</span>
                    <p className={cn('text-lg font-bold', isExceeded ? 'text-rose-500' : 'text-gray-900 dark:text-white')}>
                      {formatCurrency(spent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Meta</span>
                    <p className="text-sm font-semibold text-gray-500">{formatCurrency(planned)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isExceeded ? 'bg-rose-500' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{percentage}% utilizado</span>
                    <span>Restante: {formatCurrency(Math.max(0, planned - spent))}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Novo Orçamento Mensal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Categoria de Despesa</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                >
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Valor Limite (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 1200,00"
                  value={plannedAmount}
                  onChange={(e) => setPlannedAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-sm"
                >
                  {loading ? 'Salvando...' : 'Definir Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
