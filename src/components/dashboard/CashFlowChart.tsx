'use client';

import React from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function CashFlowChart() {
  const { transactions } = useFinanceData();

  // Group last 6 months
  const monthsData = React.useMemo(() => {
    const dataMap: Record<string, { month: string; income: number; expense: number }> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
      dataMap[key] = { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      const key = tx.date.slice(0, 7);
      if (dataMap[key]) {
        if (tx.type === 'income') {
          dataMap[key].income += Number(tx.amount);
        } else if (tx.type === 'expense') {
          dataMap[key].expense += Number(tx.amount);
        }
      }
    });

    return Object.values(dataMap);
  }, [transactions]);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Fluxo de Caixa</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Entradas vs Saídas nos últimos 6 meses</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), '']}
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
            />
            <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" name="Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
