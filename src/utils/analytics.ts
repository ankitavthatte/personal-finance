import { getCategory } from '@/data/categories';
import { Account, Budget, Transaction } from '@/data/types';
import { parseISO } from './format';

export interface MonthKey {
  year: number;
  month: number; // 0-based
}

export function isInMonth(iso: string, { year, month }: MonthKey): boolean {
  const d = parseISO(iso);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function currentMonthKey(base = new Date()): MonthKey {
  return { year: base.getFullYear(), month: base.getMonth() };
}

export function shiftMonth({ year, month }: MonthKey, delta: number): MonthKey {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function isSameMonth(a: MonthKey, b: MonthKey): boolean {
  return a.year === b.year && a.month === b.month;
}

export interface MonthSummary {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export function summarizeMonth(txns: Transaction[], key: MonthKey): MonthSummary {
  let income = 0;
  let expense = 0;
  let count = 0;
  for (const t of txns) {
    if (!isInMonth(t.date, key)) continue;
    count += 1;
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense, count };
}

export interface CategorySpend {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  share: number; // 0..1 of total expense
}

/** Spending grouped by category for a given month, sorted high → low. */
export function spendByCategory(
  txns: Transaction[],
  key: MonthKey,
  type: 'expense' | 'income' = 'expense',
): CategorySpend[] {
  const totals = new Map<string, { total: number; count: number }>();
  let grand = 0;
  for (const t of txns) {
    if (t.type !== type || !isInMonth(t.date, key)) continue;
    const entry = totals.get(t.categoryId) ?? { total: 0, count: 0 };
    entry.total += t.amount;
    entry.count += 1;
    totals.set(t.categoryId, entry);
    grand += t.amount;
  }
  const rows: CategorySpend[] = [];
  for (const [categoryId, { total, count }] of totals) {
    const cat = getCategory(categoryId);
    rows.push({
      categoryId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      total,
      count,
      share: grand > 0 ? total / grand : 0,
    });
  }
  return rows.sort((a, b) => b.total - a.total);
}

export interface BudgetProgress {
  categoryId: string;
  budget: number;
  spent: number;
  remaining: number;
  ratio: number; // spent / budget, clamped display handled by UI
  over: boolean;
}

export function budgetProgress(
  txns: Transaction[],
  budgets: Budget[],
  key: MonthKey,
): BudgetProgress[] {
  const spentByCat = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== 'expense' || !isInMonth(t.date, key)) continue;
    spentByCat.set(t.categoryId, (spentByCat.get(t.categoryId) ?? 0) + t.amount);
  }
  return budgets
    .filter((b) => b.amount > 0)
    .map((b) => {
      const spent = spentByCat.get(b.categoryId) ?? 0;
      return {
        categoryId: b.categoryId,
        budget: b.amount,
        spent,
        remaining: b.amount - spent,
        ratio: b.amount > 0 ? spent / b.amount : 0,
        over: spent > b.amount,
      };
    });
}

/**
 * Current balance of one account: its opening balance plus income minus
 * expenses. Transactions with no accountId are attributed to `defaultAccountId`
 * (the first account) so legacy data still counts.
 */
export function accountBalance(
  account: Account,
  transactions: Transaction[],
  defaultAccountId: string,
): number {
  let balance = account.opening;
  for (const t of transactions) {
    const aid = t.accountId ?? defaultAccountId;
    if (aid !== account.id) continue;
    if (t.type === 'income') balance += t.amount;
    else balance -= t.amount;
  }
  return balance;
}

/** Net worth = the sum of every account's balance. */
export function netWorth(accounts: Account[], transactions: Transaction[]): number {
  const defaultId = accounts[0]?.id ?? '';
  return accounts.reduce((sum, a) => sum + accountBalance(a, transactions, defaultId), 0);
}

/** Daily expense totals across a month — used for the trend chart. */
export function dailyExpenseSeries(txns: Transaction[], key: MonthKey): number[] {
  const days = new Date(key.year, key.month + 1, 0).getDate();
  const series = new Array(days).fill(0);
  for (const t of txns) {
    if (t.type !== 'expense' || !isInMonth(t.date, key)) continue;
    const day = parseISO(t.date).getDate() - 1;
    series[day] += t.amount;
  }
  return series;
}

export interface MonthlyBar {
  key: MonthKey;
  label: string;
  income: number;
  expense: number;
}

/** Trailing `count` months of income/expense totals for the bar chart. */
export function trailingMonths(
  txns: Transaction[],
  count: number,
  base = new Date(),
): MonthlyBar[] {
  const out: MonthlyBar[] = [];
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const key = { year: d.getFullYear(), month: d.getMonth() };
    const s = summarizeMonth(txns, key);
    out.push({ key, label: monthsShort[d.getMonth()], income: s.income, expense: s.expense });
  }
  return out;
}
