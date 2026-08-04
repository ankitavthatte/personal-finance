import { CategoryColorKey } from '@/theme';

export type TransactionType = 'expense' | 'income';

/** Ionicons glyph name — kept as string to avoid a hard type dependency. */
export type IconName = string;

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  color: CategoryColorKey;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Always stored as a positive number; sign is derived from `type`. */
  amount: number;
  categoryId: string;
  note: string;
  /** ISO date string (yyyy-mm-dd) of when the money moved. */
  date: string;
  createdAt: number;
}

/** Monthly budget cap for a single expense category. */
export interface Budget {
  categoryId: string;
  amount: number;
}

export interface Settings {
  currency: string;
  currencySymbol: string;
  /** Overall monthly spending target used on the dashboard hero. */
  monthlyBudget: number;
  name: string;
}
