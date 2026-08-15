'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/contexts/FinanceDataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseOFXorCSV } from '@/app/import/parser';

interface ParsedItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  selected: boolean;
}

export default function ImportPage() {
  const { accounts, categories, addTransaction } = useFinanceData();
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseOFXorCSV(text, categories[0]?.id || '');
      setItems(parsed);
      setSuccessCount(null);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    const toImport = items.filter((item) => item.selected);
    if (toImport.length === 0) return;

    setImporting(true);
    try {
      for (const item of toImport) {
        await addTransaction({
          account_id: selectedAccountId || null,
          credit_card_id: null,
          category_id: item.categoryId || null,
          destination_account_id: null,
          type: item.type,
          amount: item.amount,
          date: item.date,
          description: item.description,
          paid: true,
          installment_group_id: null,
          current_installment: null,
          total_installments: null,
          recurring_rule_id: null,
        });
      }
      setSuccessCount(toImport.length);
      setItems([]);
    } catch (err) {
      console.error(err);
      alert('Erro durante a importação.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Importar Extrato Bancário
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Carregue arquivos .OFX ou .CSV do seu banco para conciliação automática
        </p>
      </div>

      {/* Select Destination Account */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs max-w-md">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Conta de Destino dos Lançamentos
        </label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Box */}
      {items.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-8 sm:p-12 text-center bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
          <UploadCloud className="w-12 h-12 text-sky-500 mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
            Selecione o arquivo do extrato (.ofx ou .csv)
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Suporta arquivos emitidos por qualquer banco brasileiro (Nubank, Itaú, Bradesco, Inter, Santander, etc).
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md cursor-pointer transition-all">
            <FileText className="w-4 h-4" />
            <span>Escolher Arquivo</span>
            <input type="file" accept=".ofx,.csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Success Notification */}
      {successCount !== null && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successCount} lançamentos importados e conciliados com sucesso!</span>
        </div>
      )}

      {/* Preview Table */}
      {items.length > 0 && (
        <div className="space-y-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Pré-visualização do Extrato</h3>
              <p className="text-xs text-gray-400">Revise as transações antes de confirmar</p>
            </div>
            <button
              onClick={handleConfirmImport}
              disabled={importing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{importing ? 'Importando...' : `Confirmar Importação (${items.filter((i) => i.selected).length})`}</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].selected = e.target.checked;
                      setItems(updated);
                    }}
                    className="w-4 h-4 text-sky-600 rounded-sm"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{item.description}</p>
                    <p className="text-gray-400 text-[11px]">{formatDate(item.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={item.categoryId}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].categoryId = e.target.value;
                      setItems(updated);
                    }}
                    className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <span
                    className={cn(
                      'font-bold min-w-[80px] text-right',
                      item.type === 'income' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'
                    )}
                  >
                    {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
