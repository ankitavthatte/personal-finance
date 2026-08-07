import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { DEFAULT_CATEGORIES, setCategoryRegistry } from '@/data/categories';
import { Budget, Category, RecurringRule, Settings, Transaction } from '@/data/types';
import { advanceRecurrence, makeId, toISODate } from '@/utils/format';
import {
  DEFAULT_BUDGETS,
  DEFAULT_SETTINGS,
  generateSeedTransactions,
} from './seed';

const STORAGE_KEY = 'pennywise.state.v1';

interface PersistedState {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringRule[];
  categories: Category[];
  settings: Settings;
  onboarded: boolean;
}

interface State extends PersistedState {
  hydrated: boolean;
}

const initialState: State = {
  transactions: [],
  budgets: DEFAULT_BUDGETS,
  recurring: [],
  categories: DEFAULT_CATEGORIES,
  settings: DEFAULT_SETTINGS,
  onboarded: false,
  hydrated: false,
};

type Action =
  | { type: 'HYDRATE'; payload: PersistedState }
  | { type: 'ADD_TXN'; payload: Transaction }
  | { type: 'UPDATE_TXN'; payload: Transaction }
  | { type: 'DELETE_TXN'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_RECURRING'; payload: RecurringRule }
  | { type: 'UPDATE_RECURRING'; payload: RecurringRule }
  | { type: 'DELETE_RECURRING'; payload: string }
  | { type: 'APPLY_RECURRING'; payload: { transactions: Transaction[]; recurring: RecurringRule[] } }
  | { type: 'SET_SETTINGS'; payload: Partial<Settings> }
  | { type: 'COMPLETE_ONBOARDING'; payload: Partial<Settings> }
  | { type: 'REPLACE'; payload: Partial<PersistedState> }
  | { type: 'RESET' };

function sortTxns(txns: Transaction[]): Transaction[] {
  return [...txns].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.createdAt - a.createdAt;
  });
}

/**
 * Given the recurring rules and existing transactions, compute any occurrences
 * that are now due (nextDate on or before `today`) and the rules advanced past
 * them. Returns `null` when nothing is due, so callers can skip a dispatch.
 * Kept pure so it can run inside an effect without surprising re-renders.
 */
function computeDueRecurring(
  rules: RecurringRule[],
  transactions: Transaction[],
  today: string,
): { transactions: Transaction[]; recurring: RecurringRule[] } | null {
  const posted: Transaction[] = [];
  let changed = false;

  const nextRules = rules.map((rule) => {
    let next = rule.nextDate;
    let guard = 0;
    // Post every missed period up to today (guard bounds pathological loops).
    while (next <= today && guard < 400) {
      guard += 1;
      const already =
        transactions.some((t) => t.recurringId === rule.id && t.date === next) ||
        posted.some((t) => t.recurringId === rule.id && t.date === next);
      if (!already) {
        posted.push({
          id: makeId(),
          type: rule.type,
          amount: rule.amount,
          categoryId: rule.categoryId,
          note: rule.note,
          date: next,
          createdAt: Date.now(),
          recurringId: rule.id,
        });
      }
      next = advanceRecurrence(next, rule.frequency);
      changed = true;
    }
    return next === rule.nextDate ? rule : { ...rule, nextDate: next };
  });

  if (!changed && posted.length === 0) return null;
  return { transactions: posted, recurring: nextRules };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'ADD_TXN':
      return { ...state, transactions: sortTxns([action.payload, ...state.transactions]) };
    case 'UPDATE_TXN':
      return {
        ...state,
        transactions: sortTxns(
          state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
        ),
      };
    case 'DELETE_TXN':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'SET_BUDGET': {
      const others = state.budgets.filter((b) => b.categoryId !== action.payload.categoryId);
      const next = action.payload.amount > 0 ? [...others, action.payload] : others;
      return { ...state, budgets: next };
    }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        // Drop any budget tied to the removed category; transactions fall back
        // to "Uncategorized" via getCategory.
        budgets: state.budgets.filter((b) => b.categoryId !== action.payload),
      };
    case 'ADD_RECURRING':
      return { ...state, recurring: [...state.recurring, action.payload] };
    case 'UPDATE_RECURRING':
      return {
        ...state,
        recurring: state.recurring.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'DELETE_RECURRING':
      return { ...state, recurring: state.recurring.filter((r) => r.id !== action.payload) };
    case 'APPLY_RECURRING':
      return {
        ...state,
        transactions: action.payload.transactions.length
          ? sortTxns([...action.payload.transactions, ...state.transactions])
          : state.transactions,
        recurring: action.payload.recurring,
      };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        onboarded: true,
        settings: { ...state.settings, ...action.payload },
      };
    case 'REPLACE': {
      const p = action.payload;
      return {
        ...state,
        transactions: sortTxns(p.transactions ?? []),
        budgets: p.budgets ?? DEFAULT_BUDGETS,
        recurring: p.recurring ?? [],
        categories: p.categories && p.categories.length ? p.categories : DEFAULT_CATEGORIES,
        settings: { ...DEFAULT_SETTINGS, ...p.settings },
        onboarded: p.onboarded ?? true,
      };
    }
    case 'RESET':
      return { ...initialState, hydrated: true, onboarded: false };
    default:
      return state;
  }
}

export interface FinanceContextValue extends State {
  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (txn: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (categoryId: string, amount: number) => void;
  addCategory: (input: Omit<Category, 'id'>) => Category;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addRecurring: (input: Omit<RecurringRule, 'id' | 'createdAt'>) => RecurringRule;
  updateRecurring: (rule: RecurringRule) => void;
  deleteRecurring: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  completeOnboarding: (patch: Partial<Settings>) => void;
  loadSampleData: () => void;
  resetAll: () => void;
  /** Serialize the persisted slices to a JSON string for backup. */
  exportData: () => string;
  /** Replace all data from a parsed backup. Returns false if it looks invalid. */
  importData: (raw: unknown) => boolean;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from disk on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedState;
          dispatch({
            type: 'HYDRATE',
            payload: {
              transactions: sortTxns(parsed.transactions ?? []),
              budgets: parsed.budgets ?? DEFAULT_BUDGETS,
              recurring: parsed.recurring ?? [],
              categories:
                parsed.categories && parsed.categories.length
                  ? parsed.categories
                  : DEFAULT_CATEGORIES,
              settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
              onboarded: parsed.onboarded ?? false,
            },
          });
        } else {
          dispatch({
            type: 'HYDRATE',
            payload: {
              transactions: [],
              budgets: DEFAULT_BUDGETS,
              recurring: [],
              categories: DEFAULT_CATEGORIES,
              settings: DEFAULT_SETTINGS,
              onboarded: false,
            },
          });
        }
      } catch (e) {
        dispatch({
          type: 'HYDRATE',
          payload: {
            transactions: [],
            budgets: DEFAULT_BUDGETS,
            recurring: [],
            categories: DEFAULT_CATEGORIES,
            settings: DEFAULT_SETTINGS,
            onboarded: false,
          },
        });
      }
    })();
  }, []);

  // Mirror the category slice into the module registry so getCategory resolves
  // custom categories from non-reactive call sites (list rows, analytics).
  useEffect(() => {
    setCategoryRegistry(state.categories);
  }, [state.categories]);

  // Once hydrated, post any recurring occurrences that came due while the app
  // was closed. Runs a single pass on launch.
  useEffect(() => {
    if (!state.hydrated) return;
    const result = computeDueRecurring(state.recurring, state.transactions, toISODate(new Date()));
    if (result) dispatch({ type: 'APPLY_RECURRING', payload: result });
    // Intentionally only depends on hydration — this is a launch-time catch-up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated]);

  // Persist whenever the meaningful slices change.
  useEffect(() => {
    if (!state.hydrated) return;
    const payload: PersistedState = {
      transactions: state.transactions,
      budgets: state.budgets,
      recurring: state.recurring,
      categories: state.categories,
      settings: state.settings,
      onboarded: state.onboarded,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [
    state.transactions,
    state.budgets,
    state.recurring,
    state.categories,
    state.settings,
    state.onboarded,
    state.hydrated,
  ]);

  const addTransaction = useCallback((input: Omit<Transaction, 'id' | 'createdAt'>) => {
    const txn: Transaction = { ...input, id: makeId(), createdAt: Date.now() };
    dispatch({ type: 'ADD_TXN', payload: txn });
    return txn;
  }, []);

  const updateTransaction = useCallback((txn: Transaction) => {
    dispatch({ type: 'UPDATE_TXN', payload: txn });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TXN', payload: id });
  }, []);

  const setBudget = useCallback((categoryId: string, amount: number) => {
    dispatch({ type: 'SET_BUDGET', payload: { categoryId, amount } });
  }, []);

  const addCategory = useCallback((input: Omit<Category, 'id'>) => {
    const category: Category = { ...input, id: makeId() };
    dispatch({ type: 'ADD_CATEGORY', payload: category });
    return category;
  }, []);

  const updateCategory = useCallback((category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  }, []);

  const addRecurring = useCallback((input: Omit<RecurringRule, 'id' | 'createdAt'>) => {
    const rule: RecurringRule = { ...input, id: makeId(), createdAt: Date.now() };
    dispatch({ type: 'ADD_RECURRING', payload: rule });
    return rule;
  }, []);

  const updateRecurring = useCallback((rule: RecurringRule) => {
    dispatch({ type: 'UPDATE_RECURRING', payload: rule });
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    dispatch({ type: 'DELETE_RECURRING', payload: id });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: patch });
  }, []);

  const completeOnboarding = useCallback((patch: Partial<Settings>) => {
    dispatch({ type: 'COMPLETE_ONBOARDING', payload: patch });
  }, []);

  const loadSampleData = useCallback(() => {
    const seeded = generateSeedTransactions();
    seeded.forEach((t) => dispatch({ type: 'ADD_TXN', payload: t }));
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const exportData = useCallback(() => {
    const payload = {
      app: 'pennywise',
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions: state.transactions,
      budgets: state.budgets,
      recurring: state.recurring,
      categories: state.categories,
      settings: state.settings,
      onboarded: state.onboarded,
    };
    return JSON.stringify(payload, null, 2);
  }, [
    state.transactions,
    state.budgets,
    state.recurring,
    state.categories,
    state.settings,
    state.onboarded,
  ]);

  const importData = useCallback((raw: unknown): boolean => {
    if (!raw || typeof raw !== 'object') return false;
    const data = raw as Partial<PersistedState>;
    // A valid backup must at least carry a transactions array.
    if (!Array.isArray(data.transactions)) return false;
    dispatch({ type: 'REPLACE', payload: data });
    return true;
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      addCategory,
      updateCategory,
      deleteCategory,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      updateSettings,
      completeOnboarding,
      loadSampleData,
      resetAll,
      exportData,
      importData,
    }),
    [
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      addCategory,
      updateCategory,
      deleteCategory,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      updateSettings,
      completeOnboarding,
      loadSampleData,
      resetAll,
      exportData,
      importData,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within a FinanceProvider');
  return ctx;
}
