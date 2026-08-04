import { Budget, Settings, Transaction } from '@/data/types';
import { makeId, toISODate } from '@/utils/format';

export const DEFAULT_SETTINGS: Settings = {
  currency: 'INR',
  currencySymbol: '₹',
  monthlyBudget: 45000,
  name: 'there',
};

export const DEFAULT_BUDGETS: Budget[] = [
  { categoryId: 'groceries', amount: 9000 },
  { categoryId: 'dining', amount: 6000 },
  { categoryId: 'transport', amount: 4000 },
  { categoryId: 'shopping', amount: 5000 },
  { categoryId: 'bills', amount: 5000 },
  { categoryId: 'entertainment', amount: 3000 },
  { categoryId: 'subscriptions', amount: 1500 },
  { categoryId: 'coffee', amount: 2000 },
];

interface SeedSpec {
  categoryId: string;
  note: string;
  min: number;
  max: number;
  perMonth: number;
}

const EXPENSE_SEED: SeedSpec[] = [
  { categoryId: 'groceries', note: 'Supermarket', min: 400, max: 2200, perMonth: 6 },
  { categoryId: 'dining', note: 'Restaurant', min: 300, max: 1800, perMonth: 5 },
  { categoryId: 'coffee', note: 'Café', min: 120, max: 480, perMonth: 8 },
  { categoryId: 'transport', note: 'Cab ride', min: 120, max: 700, perMonth: 6 },
  { categoryId: 'shopping', note: 'Online order', min: 500, max: 3500, perMonth: 3 },
  { categoryId: 'entertainment', note: 'Movie night', min: 300, max: 1200, perMonth: 2 },
  { categoryId: 'bills', note: 'Electricity', min: 1200, max: 2600, perMonth: 1 },
  { categoryId: 'subscriptions', note: 'Streaming', min: 149, max: 649, perMonth: 2 },
  { categoryId: 'health', note: 'Pharmacy', min: 200, max: 1400, perMonth: 1 },
  { categoryId: 'personal', note: 'Salon', min: 300, max: 900, perMonth: 1 },
];

function rand(min: number, max: number): number {
  const v = min + Math.random() * (max - min);
  return Math.round(v / 10) * 10;
}

/**
 * Build a few months of believable history so the dashboard, budgets and
 * insights all have something meaningful to show on first launch. This is the
 * same "sample data" pattern Copilot and Monarch use to demonstrate value
 * before a user has entered anything real.
 */
export function generateSeedTransactions(base = new Date()): Transaction[] {
  const txns: Transaction[] = [];

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthDate = new Date(base.getFullYear(), base.getMonth() - monthOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // For the current month only generate up to today.
    const lastDay = monthOffset === 0 ? base.getDate() : daysInMonth;

    // Monthly income (salary) near the start of the month.
    txns.push({
      id: makeId(),
      type: 'income',
      amount: 85000,
      categoryId: 'salary',
      note: 'Monthly salary',
      date: toISODate(new Date(year, month, Math.min(1, lastDay))),
      createdAt: new Date(year, month, 1).getTime(),
    });

    // Rent on the 3rd.
    if (lastDay >= 3) {
      txns.push({
        id: makeId(),
        type: 'expense',
        amount: 22000,
        categoryId: 'rent',
        note: 'Apartment rent',
        date: toISODate(new Date(year, month, 3)),
        createdAt: new Date(year, month, 3).getTime(),
      });
    }

    for (const spec of EXPENSE_SEED) {
      for (let i = 0; i < spec.perMonth; i++) {
        const day = 1 + Math.floor(Math.random() * lastDay);
        if (day > lastDay) continue;
        const d = new Date(year, month, day);
        txns.push({
          id: makeId(),
          type: 'expense',
          amount: rand(spec.min, spec.max),
          categoryId: spec.categoryId,
          note: spec.note,
          date: toISODate(d),
          createdAt: d.getTime(),
        });
      }
    }
  }

  return txns.sort((a, b) => b.createdAt - a.createdAt);
}
