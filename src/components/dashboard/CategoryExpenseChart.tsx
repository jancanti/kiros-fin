'use client';

import React from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency } from '@/lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#06b6d4', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#6b7280'];

export function CategoryExpenseChart() {
  const { transactions, categories } = useFinanceData();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const categoryTotals = React.useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};

    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((tx) => {
        const cat = categories.find((c) => c.id === tx.category_id);
        const name = cat ? cat.name : 'Outros';
        const color = cat?.color || '#6b7280';

        if (!map[name]) {
          map[name] = { name, value: 0, color };
        }
        map[name].value += Number(tx.amount);
      });

    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [transactions, categories, currentMonth]);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Gastos por Categoria</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Distribuição no mês corrente</p>
      </div>

      <div className="h-64 w-full my-auto flex items-center justify-center">
        {categoryTotals.length === 0 ? (
          <div className="text-center text-xs text-gray-400">Nenhuma despesa registrada este mês</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {categoryTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'Gasto']}
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
