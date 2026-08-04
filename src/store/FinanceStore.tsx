import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { Budget, Settings, Transaction } from '@/data/types';
import { makeId } from '@/utils/format';
import {
  DEFAULT_BUDGETS,
  DEFAULT_SETTINGS,
  generateSeedTransactions,
} from './seed';

const STORAGE_KEY = 'pennywise.state.v1';

interface PersistedState {
  transactions: Transaction[];
  budgets: Budget[];
  settings: Settings;
  onboarded: boolean;
}

interface State extends PersistedState {
  hydrated: boolean;
}

const initialState: State = {
  transactions: [],
  budgets: DEFAULT_BUDGETS,
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
  | { type: 'SET_SETTINGS'; payload: Partial<Settings> }
  | { type: 'COMPLETE_ONBOARDING'; payload: Partial<Settings> }
  | { type: 'RESET' };

function sortTxns(txns: Transaction[]): Transaction[] {
  return [...txns].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.createdAt - a.createdAt;
  });
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
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        onboarded: true,
        settings: { ...state.settings, ...action.payload },
      };
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
  updateSettings: (patch: Partial<Settings>) => void;
  completeOnboarding: (patch: Partial<Settings>) => void;
  loadSampleData: () => void;
  resetAll: () => void;
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
            settings: DEFAULT_SETTINGS,
            onboarded: false,
          },
        });
      }
    })();
  }, []);

  // Persist whenever the meaningful slices change.
  useEffect(() => {
    if (!state.hydrated) return;
    const payload: PersistedState = {
      transactions: state.transactions,
      budgets: state.budgets,
      settings: state.settings,
      onboarded: state.onboarded,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [state.transactions, state.budgets, state.settings, state.onboarded, state.hydrated]);

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

  const value = useMemo<FinanceContextValue>(
    () => ({
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      updateSettings,
      completeOnboarding,
      loadSampleData,
      resetAll,
    }),
    [
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      updateSettings,
      completeOnboarding,
      loadSampleData,
      resetAll,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within a FinanceProvider');
  return ctx;
}
