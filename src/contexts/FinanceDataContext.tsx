'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Account, CreditCard, Category, Transaction, Budget } from '@/types/finance';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

// Fallback categories — ONLY used as UI placeholder while DB loads.
// These IDs are intentionally empty so they are never sent to the DB.
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '', user_id: null, name: 'Alimentação', type: 'expense', icon: 'utensils', color: '#f97316', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Moradia', type: 'expense', icon: 'home', color: '#3b82f6', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Transporte', type: 'expense', icon: 'car', color: '#06b6d4', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Saúde', type: 'expense', icon: 'heart-pulse', color: '#ef4444', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Lazer', type: 'expense', icon: 'film', color: '#ec4899', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Educação', type: 'expense', icon: 'book-open', color: '#8b5cf6', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Compras', type: 'expense', icon: 'shopping-bag', color: '#14b8a6', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Salário', type: 'income', icon: 'briefcase', color: '#10b981', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Investimentos', type: 'income', icon: 'trending-up', color: '#6366f1', parent_id: null, created_at: '' },
  { id: '', user_id: null, name: 'Outros', type: 'expense', icon: 'more-horizontal', color: '#6b7280', parent_id: null, created_at: '' },
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(val: any): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

/**
 * Strip joined relation objects and convert invalid UUID fields to null.
 * NOTE: installment_group_id and recurring_rule_id are NOT validated here —
 * they're generated via crypto.randomUUID() in the modal, so they're always valid.
 */
function sanitizePayload(data: any) {
  const payload = { ...data };
  // Remove joined relation objects that PostgREST rejects in mutations
  delete payload.category;
  delete payload.account;
  delete payload.credit_card;

  // FK UUID fields: empty string or non-UUID → null
  const fkUuidFields = ['category_id', 'account_id', 'credit_card_id', 'destination_account_id'];
  for (const field of fkUuidFields) {
    if (field in payload) {
      if (!payload[field] || !isValidUUID(payload[field])) {
        payload[field] = null;
      }
    }
  }

  // Group / rule IDs: if present and invalid UUID, set null (should never happen with randomUUID)
  for (const field of ['installment_group_id', 'recurring_rule_id']) {
    if (field in payload && payload[field] !== null && payload[field] !== undefined) {
      if (!isValidUUID(payload[field])) {
        payload[field] = null;
      }
    }
  }

  if (payload.amount !== undefined) {
    payload.amount = Number(payload.amount);
  }

  return payload;
}

interface FinanceDataContextType {
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (acc: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateAccount: (id: string, acc: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCreditCard: (card: Omit<CreditCard, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const FinanceDataContext = createContext<FinanceDataContextType>({
  accounts: [],
  creditCards: [],
  categories: DEFAULT_CATEGORIES,
  transactions: [],
  budgets: [],
  loading: true,
  addTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
  addAccount: async () => {},
  updateAccount: async () => {},
  deleteAccount: async () => {},
  addCreditCard: async () => {},
  updateCreditCard: async () => {},
  deleteCreditCard: async () => {},
  addBudget: async () => {},
  deleteBudget: async () => {},
  refreshData: async () => {},
});

export const useFinanceData = () => useContext(FinanceDataContext);

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Stabilize the Supabase client — createClient() must NOT be called on every render.
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Ensure user profile row exists (trigger may have already created it)
  const ensureProfile = useCallback(async (userId: string, email?: string | null) => {
    try {
      const { error } = await supabase.from('profiles').upsert(
        { id: userId, email: email || '', currency: 'BRL', updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
      if (error) console.warn('ensureProfile:', error.message);
    } catch (e) {
      console.warn('ensureProfile exception:', e);
    }
  }, [supabase]); // supabase is stable (ref.current)

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await ensureProfile(user.id, user.email);

      const [accRes, cardRes, catRes, txRes, budgetRes] = await Promise.all([
        supabase.from('accounts').select('*').order('name'),
        supabase.from('credit_cards').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('transactions')
          .select('*, category:categories(*), account:accounts!account_id(*), credit_card:credit_cards(*)')
          .order('date', { ascending: false }),
        supabase.from('budgets').select('*, category:categories(*)'),
      ]);

      if (accRes.error) console.error('accounts fetch error:', accRes.error.message);
      if (cardRes.error) console.error('credit_cards fetch error:', cardRes.error.message);
      if (catRes.error) console.error('categories fetch error:', catRes.error.message);
      if (txRes.error) console.error('transactions fetch error:', txRes.error.message);
      if (budgetRes.error) console.error('budgets fetch error:', budgetRes.error.message);

      if (accRes.data) setAccounts(accRes.data as Account[]);
      if (cardRes.data) setCreditCards(cardRes.data as CreditCard[]);
      if (catRes.data) setCategories(catRes.data as Category[]);
      if (txRes.data) setTransactions(txRes.data as Transaction[]);
      if (budgetRes.data) setBudgets(budgetRes.data as Budget[]);
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, ensureProfile]); // supabase is stable, user changes on login/logout

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Transactions ────────────────────────────────────────────────────────────

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    await ensureProfile(user.id, user.email);

    const clean = sanitizePayload(txData);

    const { error } = await supabase.from('transactions').insert({
      ...clean,
      user_id: user.id,
    });

    if (error) {
      console.error('Supabase Insert Transaction Error:', error);
      throw new Error(error.message || 'Erro ao inserir transação.');
    }

    await loadData();
  };

  const updateTransaction = async (id: string, txData: Partial<Transaction>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const clean = sanitizePayload(txData);
    delete clean.id;
    delete clean.user_id;
    delete clean.created_at;
    clean.updated_at = new Date().toISOString();

    const { error } = await supabase.from('transactions').update(clean).eq('id', id);
    if (error) {
      console.error('Supabase Update Transaction Error:', error);
      throw new Error(error.message || 'Erro ao atualizar transação.');
    }
    await loadData();
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Transaction Error:', error);
      throw new Error(error.message || 'Erro ao excluir transação.');
    }
    await loadData();
  };

  // ─── Accounts ────────────────────────────────────────────────────────────────

  const addAccount = async (accData: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    await ensureProfile(user.id, user.email);

    const clean = sanitizePayload(accData);
    const { error } = await supabase.from('accounts').insert({ ...clean, user_id: user.id });
    if (error) {
      console.error('Supabase Add Account Error:', error);
      throw new Error(error.message || 'Erro ao criar conta.');
    }
    await loadData();
  };

  const updateAccount = async (id: string, accData: Partial<Account>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const clean = sanitizePayload(accData);
    delete clean.id; delete clean.user_id; delete clean.created_at;
    clean.updated_at = new Date().toISOString();

    const { error } = await supabase.from('accounts').update(clean).eq('id', id);
    if (error) {
      console.error('Supabase Update Account Error:', error);
      throw new Error(error.message || 'Erro ao atualizar conta.');
    }
    await loadData();
  };

  const deleteAccount = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Account Error:', error);
      throw new Error(error.message || 'Erro ao excluir conta.');
    }
    await loadData();
  };

  // ─── Credit Cards ─────────────────────────────────────────────────────────────

  const addCreditCard = async (cardData: Omit<CreditCard, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    await ensureProfile(user.id, user.email);

    const clean = sanitizePayload(cardData);
    const { error } = await supabase.from('credit_cards').insert({ ...clean, user_id: user.id });
    if (error) {
      console.error('Supabase Add Credit Card Error:', error);
      throw new Error(error.message || 'Erro ao criar cartão.');
    }
    await loadData();
  };

  const updateCreditCard = async (id: string, cardData: Partial<CreditCard>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const clean = sanitizePayload(cardData);
    delete clean.id; delete clean.user_id; delete clean.created_at;
    clean.updated_at = new Date().toISOString();

    const { error } = await supabase.from('credit_cards').update(clean).eq('id', id);
    if (error) {
      console.error('Supabase Update Credit Card Error:', error);
      throw new Error(error.message || 'Erro ao atualizar cartão.');
    }
    await loadData();
  };

  const deleteCreditCard = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const { error } = await supabase.from('credit_cards').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Credit Card Error:', error);
      throw new Error(error.message || 'Erro ao excluir cartão.');
    }
    await loadData();
  };

  // ─── Budgets ─────────────────────────────────────────────────────────────────

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    await ensureProfile(user.id, user.email);

    const clean = sanitizePayload(budgetData);
    const { error } = await supabase.from('budgets').insert({ ...clean, user_id: user.id });
    if (error) {
      console.error('Supabase Add Budget Error:', error);
      throw new Error(error.message || 'Erro ao criar orçamento.');
    }
    await loadData();
  };

  const deleteBudget = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Budget Error:', error);
      throw new Error(error.message || 'Erro ao excluir orçamento.');
    }
    await loadData();
  };

  return (
    <FinanceDataContext.Provider
      value={{
        accounts,
        creditCards,
        categories,
        transactions,
        budgets,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        addBudget,
        deleteBudget,
        refreshData: loadData,
      }}
    >
      {children}
    </FinanceDataContext.Provider>
  );
}
