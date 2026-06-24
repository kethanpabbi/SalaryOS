import type { SalaryData, BudgetItem } from '@/types/salary'

export function estimateInHand(salary: SalaryData): number {
  const monthly = salary.ctc / 12
  // Rough India new-regime estimate: ~20% effective deduction on CTC for typical packages
  if (salary.country === 'IN') {
    const annualBasic = salary.basic
    const annualHRA = salary.hra
    const pf = salary.companyPF ?? Math.min(annualBasic * 0.12, 21600)
    const gratuity = salary.gratuity ?? annualBasic * 0.0481
    const taxableCtc = salary.ctc - pf - gratuity
    // Standard deduction 75k (new regime FY25)
    const taxableIncome = Math.max(0, taxableCtc - 75000)
    const tax = calcIncomeTaxIN(taxableIncome, salary.taxRegime ?? 'new')
    const cess = tax * 0.04
    const annualInHand = taxableCtc - tax - cess
    return Math.round(annualInHand / 12)
  }
  // Generic: 70% of monthly CTC as rough estimate
  return Math.round(monthly * 0.7)
}

function calcIncomeTaxIN(income: number, regime: 'new' | 'old'): number {
  if (regime === 'new') {
    // FY 2025-26 new regime slabs
    if (income <= 400000) return 0
    if (income <= 800000) return (income - 400000) * 0.05
    if (income <= 1200000) return 20000 + (income - 800000) * 0.10
    if (income <= 1600000) return 60000 + (income - 1200000) * 0.15
    if (income <= 2000000) return 120000 + (income - 1600000) * 0.20
    if (income <= 2400000) return 200000 + (income - 2000000) * 0.25
    return 300000 + (income - 2400000) * 0.30
  }
  // Old regime slabs
  if (income <= 250000) return 0
  if (income <= 500000) return (income - 250000) * 0.05
  if (income <= 1000000) return 12500 + (income - 500000) * 0.20
  return 112500 + (income - 1000000) * 0.30
}

export function calcSurplus(inHand: number, budget: BudgetItem[]): number {
  const totalExpenses = budget.reduce((sum, item) => sum + item.amount, 0)
  return inHand - totalExpenses
}

export function calcSavingsRate(surplus: number, inHand: number): number {
  if (inHand === 0) return 0
  return Math.round((surplus / inHand) * 100)
}

export function projectWealth(
  monthlyInvest: number,
  years: number,
  cagr: number,
  lumpsum = 0
): number {
  const r = cagr / 100 / 12
  const n = years * 12
  const futureValueSIP = r === 0 ? monthlyInvest * n : monthlyInvest * ((Math.pow(1 + r, n) - 1) / r)
  const futureValueLump = lumpsum * Math.pow(1 + cagr / 100, years)
  return Math.round(futureValueSIP + futureValueLump)
}

export function calcESPP(
  basePay: number,
  matchPct: number,
  contribPct: number
): { yourContrib: number; companyAdd: number; total: number } {
  const yourContrib = Math.round((basePay * contribPct) / 100)
  const companyAdd = Math.round((yourContrib * matchPct) / 100)
  return { yourContrib, companyAdd, total: yourContrib + companyAdd }
}
