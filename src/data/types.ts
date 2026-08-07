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
  /** Set when this transaction was auto-posted from a recurring rule. */
  recurringId?: string;
}

/** A savings goal the user is putting money aside for. */
export interface Goal {
  id: string;
  name: string;
  icon: IconName;
  color: CategoryColorKey;
  /** Amount the user is aiming to save. */
  target: number;
  /** Amount saved so far. */
  saved: number;
  createdAt: number;
}

/** How often a recurring rule repeats. */
export type RecurrenceFrequency = 'weekly' | 'monthly';

/**
 * A rule that automatically posts a transaction on its due date. On every app
 * launch, any occurrence whose `nextDate` is due (today or earlier) is posted
 * and the rule advances to the following period.
 */
export interface RecurringRule {
  id: string;
  type: TransactionType;
  /** Always a positive number; sign is derived from `type`. */
  amount: number;
  categoryId: string;
  note: string;
  frequency: RecurrenceFrequency;
  /** ISO date (yyyy-mm-dd) of the next occurrence still to be posted. */
  nextDate: string;
  createdAt: number;
}

/** Monthly budget cap for a single expense category. */
export interface Budget {
  categoryId: string;
  amount: number;
}

/** How the app chooses light vs dark: follow the OS, or force one. */
export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  currency: string;
  currencySymbol: string;
  /** Overall monthly spending target used on the dashboard hero. */
  monthlyBudget: number;
  name: string;
  /** Appearance preference. Defaults to following the system. */
  theme: ThemePreference;
  /** 4-digit app-lock PIN. Empty string means app lock is off. */
  pin: string;
}
