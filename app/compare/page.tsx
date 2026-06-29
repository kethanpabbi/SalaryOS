'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { estimateInHand, calcSurplus, projectWealth } from '@/lib/salaryCalc'
import type { SalaryData } from '@/types/salary'

const DEMO_A: SalaryData = {
  currency: 'INR', ctc: 3500000, basePay: 1800000, basic: 900000, hra: 450000,
  flexiBenefit: 200000, companyPF: 108000, gratuity: 43290, variablePay: 350000,
  joiningBonus: 200000, joiningBonusClawbackMonths: 12, country: 'IN', taxRegime: 'new',
}
const DEMO_B: SalaryData = {
  currency: 'INR', ctc: 4200000, basePay: 2100000, basic: 1050000, hra: 525000,
  flexiBenefit: 150000, companyPF: 126000, gratuity: 50505, variablePay: 600000,
  country: 'IN', taxRegime: 'new',
}

type OfferForm = {
  label: string
  ctc: string
  basic: string
  hra: string
  flexiBenefit: string
  companyPF: string
  gratuity: string
  variablePay: string
  joiningBonus: string
}

const emptyForm = (label: string): OfferForm => ({
  label, ctc: '', basic: '', hra: '', flexiBenefit: '',
  companyPF: '', gratuity: '', variablePay: '', joiningBonus: '',
})

function formToSalary(f: OfferForm): SalaryData {
  const n = (v: string) => parseFloat(v.replace(/,/g, '')) || 0
  return {
    currency: 'INR', country: 'IN', taxRegime: 'new',
    ctc: n(f.ctc), basePay: n(f.basic) * 2, basic: n(f.basic), hra: n(f.hra),
    flexiBenefit: n(f.flexiBenefit) || undefined, companyPF: n(f.companyPF) || undefined,
    gratuity: n(f.gratuity) || undefined, variablePay: n(f.variablePay) || undefined,
    joiningBonus: n(f.joiningBonus) || undefined,
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
function fmtShort(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

function OfferFormCard({ form, onChange }: { form: OfferForm; onChange: (f: OfferForm) => void }) {
  const fields: { key: keyof OfferForm; label: string; required?: boolean }[] = [
    { key: 'ctc', label: 'Annual CTC', required: true },
    { key: 'basic', label: 'Basic', required: true },
    { key: 'hra', label: 'HRA', required: true },
    { key: 'flexiBenefit', label: 'Flexi Benefit' },
    { key: 'companyPF', label: 'Company PF (annual)' },
    { key: 'gratuity', label: 'Gratuity (annual)' },
    { key: 'variablePay', label: 'Variable Pay' },
    { key: 'joiningBonus', label: 'Joining Bonus' },
  ]
  return (
    <div className="space-y-3">
      <Input
        placeholder="Offer name (e.g. Company A)"
        value={form.label}
        onChange={(e) => onChange({ ...form, label: e.target.value })}
        className="font-medium"
      />
      {fields.map(({ key, label, required }) => (
        <div key={key}>
          <Label className="text-xs">{label}{required && ' *'}</Label>
          <Input
            type="number"
            placeholder="0"
            value={form[key]}
            onChange={(e) => onChange({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  )
}

type CompareRow = { label: string; a: string | number; b: string | number; winner?: 'a' | 'b' | 'tie'; fmt?: (v: number) => string }

function CompareTable({ salA, salB, labelA, labelB }: { salA: SalaryData; salB: SalaryData; labelA: string; labelB: string }) {
  const inHandA = estimateInHand(salA)
  const inHandB = estimateInHand(salB)
  const defaultExpenses = [20000, 5000, 8000, 3000, 10000].reduce((a, b) => a + b, 0)
  const surplusA = calcSurplus(inHandA, [
    { label: 'Rent', amount: 20000, category: 'housing' },
    { label: 'Transport', amount: 5000, category: 'transport' },
    { label: 'Food', amount: 8000, category: 'food' },
    { label: 'Lifestyle', amount: 3000, category: 'lifestyle' },
    { label: 'Investments', amount: 10000, category: 'investment' },
  ])
  const surplusB = calcSurplus(inHandB, [
    { label: 'Rent', amount: 20000, category: 'housing' },
    { label: 'Transport', amount: 5000, category: 'transport' },
    { label: 'Food', amount: 8000, category: 'food' },
    { label: 'Lifestyle', amount: 3000, category: 'lifestyle' },
    { label: 'Investments', amount: 10000, category: 'investment' },
  ])
  const wealth3A = projectWealth(Math.max(0, surplusA), 3, 12) + projectWealth(0, 3, 8.25, (salA.companyPF ?? 0) * 3)
  const wealth3B = projectWealth(Math.max(0, surplusB), 3, 12) + projectWealth(0, 3, 8.25, (salB.companyPF ?? 0) * 3)

  const winner = (a: number, b: number): 'a' | 'b' | 'tie' => a > b ? 'a' : b > a ? 'b' : 'tie'

  const rows: CompareRow[] = [
    { label: 'Annual CTC', a: salA.ctc, b: salB.ctc, winner: winner(salA.ctc, salB.ctc), fmt: fmtShort },
    { label: 'Monthly in-hand (est.)', a: inHandA, b: inHandB, winner: winner(inHandA, inHandB), fmt: fmt },
    { label: 'Basic', a: salA.basic, b: salB.basic, winner: winner(salA.basic, salB.basic), fmt: fmtShort },
    { label: 'Variable pay', a: salA.variablePay ?? 0, b: salB.variablePay ?? 0, winner: winner(salA.variablePay ?? 0, salB.variablePay ?? 0), fmt: fmtShort },
    { label: 'Joining bonus', a: salA.joiningBonus ?? 0, b: salB.joiningBonus ?? 0, winner: winner(salA.joiningBonus ?? 0, salB.joiningBonus ?? 0), fmt: fmtShort },
    { label: 'Monthly surplus (default budget)', a: surplusA, b: surplusB, winner: winner(surplusA, surplusB), fmt: fmt },
    { label: '3-year corpus (MF 12% CAGR)', a: wealth3A, b: wealth3B, winner: winner(wealth3A, wealth3B), fmt: fmtShort },
  ]

  const winsA = rows.filter((r) => r.winner === 'a').length
  const winsB = rows.filter((r) => r.winner === 'b').length
  const overall = winsA > winsB ? 'a' : winsB > winsA ? 'b' : 'tie'

  return (
    <div className="space-y-4">
      {/* Overall winner banner */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${overall === 'a' ? 'bg-blue-500/10 border border-blue-500/30' : overall === 'b' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-muted'}`}>
        <Trophy size={18} className={overall === 'a' ? 'text-blue-500' : overall === 'b' ? 'text-purple-500' : 'text-muted-foreground'} />
        <span className="font-medium text-sm">
          {overall === 'tie' ? 'These offers are very close' : `${overall === 'a' ? labelA : labelB} wins overall (${Math.max(winsA, winsB)}/${rows.length} metrics)`}
        </span>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-3 bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>Metric</span>
          <span className="text-center text-blue-600 dark:text-blue-400">{labelA}</span>
          <span className="text-center text-purple-600 dark:text-purple-400">{labelB}</span>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-3 px-4 py-2.5 text-sm border-t border-border items-center">
            <span className="text-muted-foreground text-xs">{row.label}</span>
            <span className={`text-center font-medium ${row.winner === 'a' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              {row.fmt ? row.fmt(row.a as number) : row.a}
              {row.winner === 'a' && <span className="ml-1 text-xs">✓</span>}
            </span>
            <span className={`text-center font-medium ${row.winner === 'b' ? 'text-purple-600 dark:text-purple-400' : ''}`}>
              {row.fmt ? row.fmt(row.b as number) : row.b}
              {row.winner === 'b' && <span className="ml-1 text-xs">✓</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [formA, setFormA] = useState<OfferForm>(emptyForm('Offer A'))
  const [formB, setFormB] = useState<OfferForm>(emptyForm('Offer B'))
  const [compared, setCompared] = useState(false)
  const [usingDemo, setUsingDemo] = useState(false)

  const salA = usingDemo ? DEMO_A : formToSalary(formA)
  const salB = usingDemo ? DEMO_B : formToSalary(formB)
  const canCompare = usingDemo || (parseFloat(formA.ctc) > 0 && parseFloat(formB.ctc) > 0)

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/planner" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="font-bold text-lg">Compare Offers</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {!compared ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Enter two offers to compare them side-by-side.</p>
              <Button variant="outline" size="sm" onClick={() => { setUsingDemo(true); setCompared(true) }}>
                Try with demo offers
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-blue-600 dark:text-blue-400">Offer A</CardTitle>
                </CardHeader>
                <CardContent>
                  <OfferFormCard form={formA} onChange={setFormA} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-purple-600 dark:text-purple-400">Offer B</CardTitle>
                </CardHeader>
                <CardContent>
                  <OfferFormCard form={formB} onChange={setFormB} />
                </CardContent>
              </Card>
            </div>

            <Button className="w-full" disabled={!canCompare} onClick={() => setCompared(true)}>
              Compare <ArrowRight size={14} className="ml-2" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {usingDemo ? 'Demo: 35L vs 42L CTC' : `${formA.label || 'Offer A'} vs ${formB.label || 'Offer B'}`}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => { setCompared(false); setUsingDemo(false) }}>
                Edit offers
              </Button>
            </div>
            <CompareTable
              salA={salA}
              salB={salB}
              labelA={usingDemo ? '35L Package' : formA.label || 'Offer A'}
              labelB={usingDemo ? '42L Package' : formB.label || 'Offer B'}
            />
          </>
        )}
      </div>
    </div>
  )
}
