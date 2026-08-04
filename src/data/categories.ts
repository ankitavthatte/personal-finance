import { Category } from './types';

/**
 * Default categories. Icons are Ionicons glyphs and colors reference keys in
 * the curated `categoryPalette`. This mirrors how leading apps ship a sensible
 * starter set that covers ~90% of everyday spending out of the box.
 */
export const EXPENSE_CATEGORIES: Category[] = [
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

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: 'green', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: 'teal', type: 'income' },
  { id: 'investment', name: 'Investments', icon: 'trending-up', color: 'blue', type: 'income' },
  { id: 'refund', name: 'Refunds', icon: 'arrow-undo', color: 'lime', type: 'income' },
  { id: 'gift-income', name: 'Gifts', icon: 'gift', color: 'purple', type: 'income' },
  { id: 'other-income', name: 'Other', icon: 'ellipsis-horizontal', color: 'slate', type: 'income' },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const CATEGORY_MAP: Record<string, Category> = ALL_CATEGORIES.reduce(
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

export function getCategory(id: string): Category {
  return CATEGORY_MAP[id] ?? UNKNOWN;
}
