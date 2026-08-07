import { Category } from './types';

/**
 * Default categories. Icons are Ionicons glyphs and colors reference keys in
 * the curated `categoryPalette`. This mirrors how leading apps ship a sensible
 * starter set that covers ~90% of everyday spending out of the box.
 *
 * These are only the *seed* — the live set of categories is owned by the store
 * (users can add, rename, recolor and remove them) and mirrored into the
 * registry below so `getCategory` keeps working in non-reactive call sites.
 */
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'groceries', name: 'Groceries', icon: 'cart', color: 'green', type: 'expense' },
  { id: 'dining', name: 'Dining Out', icon: 'restaurant', color: 'orange', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'car-sport', color: 'blue', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: 'pink', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt', color: 'teal', type: 'expense' },
  { id: 'rent', name: 'Rent & Housing', icon: 'home', color: 'brown', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: 'violet', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'fitness', color: 'red', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: 'indigo', type: 'expense' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'repeat', color: 'cyan', type: 'expense' },
  { id: 'personal', name: 'Personal Care', icon: 'sparkles', color: 'rose', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: 'amber', type: 'expense' },
  { id: 'gifts', name: 'Gifts & Donations', icon: 'gift', color: 'purple', type: 'expense' },
  { id: 'coffee', name: 'Coffee & Snacks', icon: 'cafe', color: 'brown', type: 'expense' },
  { id: 'other-expense', name: 'Other', icon: 'ellipsis-horizontal', color: 'slate', type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: 'green', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: 'teal', type: 'income' },
  { id: 'investment', name: 'Investments', icon: 'trending-up', color: 'blue', type: 'income' },
  { id: 'refund', name: 'Refunds', icon: 'arrow-undo', color: 'lime', type: 'income' },
  { id: 'gift-income', name: 'Gifts', icon: 'gift', color: 'purple', type: 'income' },
  { id: 'other-income', name: 'Other', icon: 'ellipsis-horizontal', color: 'slate', type: 'income' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

const DEFAULT_MAP: Record<string, Category> = DEFAULT_CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, Category>,
);

const UNKNOWN: Category = {
  id: 'unknown',
  name: 'Uncategorized',
  icon: 'help-circle',
  color: 'slate',
  type: 'expense',
};

/**
 * Live registry, kept in sync with the store's category slice via
 * `setCategoryRegistry`. Lets `getCategory` resolve custom categories from any
 * call site (list rows, analytics) without threading the list everywhere.
 */
let REGISTRY: Record<string, Category> = { ...DEFAULT_MAP };

export function setCategoryRegistry(categories: Category[]): void {
  const map: Record<string, Category> = {};
  for (const c of categories) map[c.id] = c;
  REGISTRY = map;
}

export function getCategory(id: string): Category {
  return REGISTRY[id] ?? DEFAULT_MAP[id] ?? UNKNOWN;
}
