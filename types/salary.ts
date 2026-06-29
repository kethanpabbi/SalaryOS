export interface SalaryData {
  currency: string
  ctc: number
  basePay: number
  basic: number
  hra: number
  flexiBenefit?: number
  conveyance?: number
  companyPF?: number
  gratuity?: number
  variablePay?: number
  joiningBonus?: number
  joiningBonusClawbackMonths?: number
  esppMatchPercent?: number
  esppMaxContribPercent?: number
  npsPercent?: number
  country: string
  taxRegime?: 'new' | 'old'
  rawText?: string
}

export interface BudgetItem {
  label: string
  amount: number
  category: 'housing' | 'transport' | 'food' | 'lifestyle' | 'investment' | 'other'
}

export interface PlannerState {
  salary: SalaryData | null
  budget: BudgetItem[]
  inHandEstimate: number
  monthlySurplus: number
  savingsRate: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  error?: boolean
}
