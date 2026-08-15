export type AccountType = 'checking' | 'wallet' | 'investment' | 'savings';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type CategoryType = 'income' | 'expense';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance: number;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parent_id: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  credit_card_id: string | null;
  category_id: string | null;
  destination_account_id: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  paid: boolean;
  installment_group_id: string | null;
  current_installment: number | null;
  total_installments: number | null;
  recurring_rule_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation fields
  category?: Category | null;
  account?: Account | null;
  credit_card?: CreditCard | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month_year: string; // 'YYYY-MM'
  planned_amount: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  spent_amount?: number;
}
