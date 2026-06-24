'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSalaryStore } from '@/hooks/useSalaryStore'
import { estimateInHand } from '@/lib/salaryCalc'

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function Row({
  label,
  annual,
  currency,
  color,
}: {
  label: string
  annual: number
  currency: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-medium ${color}`}>{fmt(annual, currency)}</span>
        <span className="text-xs text-muted-foreground ml-2">({fmt(Math.round(annual / 12), currency)}/mo)</span>
      </div>
    </div>
  )
}

export default function CompensationCard() {
  const { salaryData } = useSalaryStore()

  if (!salaryData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compensation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4">
            Upload your offer letter to see your real breakdown
          </p>
        </CardContent>
      </Card>
    )
  }

  const s = salaryData
  const c = s.currency
  const inHand = estimateInHand(s)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Compensation Breakdown</CardTitle>
          <Badge variant="outline">{s.country} · {s.taxRegime ?? 'new'} regime</Badge>
        </div>
        <div className="mt-2 p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-muted-foreground">Est. monthly in-hand</p>
          <p className="text-3xl font-bold text-primary">{fmt(inHand, c)}</p>
          <p className="text-xs text-muted-foreground">Annual CTC: {fmt(s.ctc, c)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Components</p>
        <Row label="Basic" annual={s.basic} currency={c} color="text-foreground" />
        <Row label="HRA" annual={s.hra} currency={c} color="text-blue-600 dark:text-blue-400" />
        {s.flexiBenefit && <Row label="Flexi Benefit" annual={s.flexiBenefit} currency={c} color="text-blue-600 dark:text-blue-400" />}
        {s.conveyance && <Row label="Conveyance" annual={s.conveyance} currency={c} color="text-blue-600 dark:text-blue-400" />}
        {s.companyPF && <Row label="Company PF" annual={s.companyPF} currency={c} color="text-green-600 dark:text-green-400" />}
        {s.gratuity && <Row label="Gratuity" annual={s.gratuity} currency={c} color="text-green-600 dark:text-green-400" />}
        {s.variablePay && <Row label="Variable Pay" annual={s.variablePay} currency={c} color="text-amber-600 dark:text-amber-400" />}
        {s.joiningBonus && (
          <Row
            label={`Joining Bonus${s.joiningBonusClawbackMonths ? ` (clawback ${s.joiningBonusClawbackMonths}mo)` : ''}`}
            annual={s.joiningBonus}
            currency={c}
            color="text-amber-600 dark:text-amber-400"
          />
        )}
        <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Employer contrib</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Allowances</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Variable</span>
        </div>
      </CardContent>
    </Card>
  )
}
