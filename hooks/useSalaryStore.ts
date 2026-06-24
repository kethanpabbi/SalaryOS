import { create } from 'zustand'
import type { SalaryData, BudgetItem } from '@/types/salary'

interface SalaryStore {
  salaryData: SalaryData | null
  budgetItems: BudgetItem[]
  sessionId: string | null
  setSalary: (data: SalaryData) => void
  updateBudgetItem: (label: string, amount: number) => void
  setBudgetItems: (items: BudgetItem[]) => void
  reset: () => void
}

const defaultBudget: BudgetItem[] = [
  { label: 'Rent', amount: 20000, category: 'housing' },
  { label: 'Car / Transport', amount: 5000, category: 'transport' },
  { label: 'Groceries', amount: 8000, category: 'food' },
  { label: 'Subscriptions & Lifestyle', amount: 3000, category: 'lifestyle' },
  { label: 'Investments / MF SIP', amount: 10000, category: 'investment' },
]

export const useSalaryStore = create<SalaryStore>((set) => ({
  salaryData: null,
  budgetItems: defaultBudget,
  sessionId: null,
  setSalary: (data) => set({ salaryData: data }),
  updateBudgetItem: (label, amount) =>
    set((state) => ({
      budgetItems: state.budgetItems.map((item) =>
        item.label === label ? { ...item, amount } : item
      ),
    })),
  setBudgetItems: (items) => set({ budgetItems: items }),
  reset: () => set({ salaryData: null, budgetItems: defaultBudget, sessionId: null }),
}))
