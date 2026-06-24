'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useSalaryStore } from '@/hooks/useSalaryStore'
import { estimateInHand, calcSurplus, calcSavingsRate } from '@/lib/salaryCalc'
import type { BudgetItem } from '@/types/salary'

const PRESETS: Record<'Lean' | 'Comfortable' | 'Full Lifestyle', Partial<Record<string, number>>> = {
  Lean: { Rent: 12000, 'Car / Transport': 2000, Groceries: 5000, 'Subscriptions & Lifestyle': 1500, 'Investments / MF SIP': 15000 },
  Comfortable: { Rent: 20000, 'Car / Transport': 5000, Groceries: 8000, 'Subscriptions & Lifestyle': 3000, 'Investments / MF SIP': 10000 },
  'Full Lifestyle': { Rent: 35000, 'Car / Transport': 10000, Groceries: 12000, 'Subscriptions & Lifestyle': 8000, 'Investments / MF SIP': 5000 },
}

const MAX: Record<string, number> = {
  Rent: 100000,
  'Car / Transport': 30000,
  Groceries: 30000,
  'Subscriptions & Lifestyle': 20000,
  'Investments / MF SIP': 100000,
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function verdictColor(rate: number) {
  if (rate >= 35) return 'text-green-600 dark:text-green-400'
  if (rate >= 20) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function verdictLabel(rate: number) {
  if (rate >= 35) return 'Great savings rate!'
  if (rate >= 20) return 'Moderate savings'
  return 'Low savings — review expenses'
}

export default function BudgetPlanner() {
  const { salaryData, budgetItems, updateBudgetItem, setBudgetItems } = useSalaryStore()
  const inHand = salaryData ? estimateInHand(salaryData) : 80000
  const surplus = calcSurplus(inHand, budgetItems)
  const savingsRate = calcSavingsRate(surplus, inHand)
  const currency = salaryData?.currency ?? 'INR'

  function applyPreset(preset: keyof typeof PRESETS) {
    const values = PRESETS[preset]
    setBudgetItems(
      budgetItems.map((item) =>
        values[item.label] !== undefined ? { ...item, amount: values[item.label]! } : item
      )
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Budget Planner</CardTitle>
          <div className="flex gap-2">
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {budgetItems.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.label}</span>
              <span className="font-medium">₹{fmt(item.amount)}/mo</span>
            </div>
            <Slider
              aria-label={item.label}
              min={0}
              max={MAX[item.label] ?? 50000}
              step={500}
              value={[item.amount]}
              onValueChange={(vals) => { const arr = Array.isArray(vals) ? vals : [vals]; updateBudgetItem(item.label, arr[0]) }}
            />
          </div>
        ))}

        <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly in-hand</span>
            <span className="font-medium">₹{fmt(inHand)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total expenses</span>
            <span className="font-medium">₹{fmt(budgetItems.reduce((s, i) => s + i.amount, 0))}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
            <span>Monthly surplus</span>
            <span className={surplus >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600'}>
              ₹{fmt(Math.abs(surplus))}{surplus < 0 ? ' deficit' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Savings rate</span>
            <Badge
              className={`${verdictColor(savingsRate)} bg-transparent border-current`}
              variant="outline"
            >
              {savingsRate}% · {verdictLabel(savingsRate)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
