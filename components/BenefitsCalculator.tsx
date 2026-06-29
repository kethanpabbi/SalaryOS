'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useSalaryStore } from '@/hooks/useSalaryStore'
import { estimateInHand } from '@/lib/salaryCalc'

function fmt(n: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)
}

function fmtShort(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

// ── ESPP ──────────────────────────────────────────────────────────────────────

function ESPPTab() {
  const { salaryData } = useSalaryStore()
  const basePay = salaryData?.basePay ?? 1800000
  const currency = salaryData?.currency ?? 'INR'

  const [contribPct, setContribPct] = useState(salaryData?.esppMaxContribPercent ?? 10)
  const [matchPct, setMatchPct] = useState(salaryData?.esppMatchPercent ?? 15)
  const [discountPct, setDiscountPct] = useState(15) // typical ESPP discount
  const [holdMonths, setHoldMonths] = useState(12)

  const annualContrib = Math.round((basePay * contribPct) / 100)
  const companyMatch = Math.round((annualContrib * matchPct) / 100)
  const discountGain = Math.round((annualContrib * discountPct) / 100)
  const totalInvested = annualContrib
  const totalValue = annualContrib + companyMatch + discountGain
  const totalGain = companyMatch + discountGain
  const effectiveReturn = totalInvested > 0 ? Math.round((totalGain / totalInvested) * 100) : 0

  // India tax: ESPP gain = perquisite at exercise, taxed as salary. Capital gain on sale.
  const perquisiteTax = Math.round(totalGain * 0.3) // ~30% slab
  const netGain = totalGain - perquisiteTax

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-primary/10 text-center">
          <p className="text-xs text-muted-foreground mb-1">Your annual contribution</p>
          <p className="text-xl font-bold text-primary">{fmt(annualContrib, currency)}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <p className="text-xs text-muted-foreground mb-1">Est. net gain (after tax)</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(netGain, currency)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Your contribution</span>
          <span className="font-medium">{contribPct}% of base</span>
        </div>
        <Slider min={1} max={20} step={1} value={[contribPct]}
          onValueChange={(v) => setContribPct(Array.isArray(v) ? v[0] : v)} />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Company match</span>
          <span className="font-medium">{matchPct}%</span>
        </div>
        <Slider min={0} max={100} step={5} value={[matchPct]}
          onValueChange={(v) => setMatchPct(Array.isArray(v) ? v[0] : v)} />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Purchase discount</span>
          <span className="font-medium">{discountPct}%</span>
        </div>
        <Slider min={0} max={30} step={1} value={[discountPct]}
          onValueChange={(v) => setDiscountPct(Array.isArray(v) ? v[0] : v)} />
      </div>

      <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
        <div className="flex justify-between">
          <span>Company match</span><span>{fmt(companyMatch, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount gain</span><span>{fmt(discountGain, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ~30% (perquisite)</span><span className="text-red-500">−{fmt(perquisiteTax, currency)}</span>
        </div>
        <div className="flex justify-between font-medium text-foreground border-t border-border pt-1 mt-1">
          <span>Effective return</span>
          <Badge variant="outline" className="text-green-600 border-green-500">{effectiveReturn}% on contribution</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        * Gain taxed as perquisite in India (new regime ~30%). Actual tax depends on your slab. Consult a CA.
      </p>
    </div>
  )
}

// ── NPS ───────────────────────────────────────────────────────────────────────

function NPSTab() {
  const { salaryData } = useSalaryStore()
  const basic = salaryData?.basic ?? 900000
  const ctc = salaryData?.ctc ?? 3500000
  const currency = salaryData?.currency ?? 'INR'
  const inHand = salaryData ? estimateInHand(salaryData) : 80000

  const [employerPct, setEmployerPct] = useState(10)
  const [employeePct, setEmployeePct] = useState(6)
  const [years, setYears] = useState(20)

  const employerAnnual = Math.round((basic * employerPct) / 100)
  const employeeAnnual = Math.round((basic * employeePct) / 100)

  // Tax deduction: employer NPS u/s 80CCD(2) — deductible up to 14% of basic (new regime)
  const deductionLimit = Math.round(basic * 0.14)
  const actualDeduction = Math.min(employerAnnual, deductionLimit)
  const taxSaving = Math.round(actualDeduction * 0.3) // 30% slab

  // Employee NPS 80CCD(1B) — ₹50k additional deduction (only old regime)
  const employeeDeduction = salaryData?.taxRegime === 'old' ? Math.min(employeeAnnual, 50000) : 0
  const employeeTaxSaving = Math.round(employeeDeduction * 0.3)

  // Corpus projection at 10% CAGR
  const totalMonthly = (employerAnnual + employeeAnnual) / 12
  const r = 0.10 / 12
  const n = years * 12
  const corpus = Math.round(totalMonthly * ((Math.pow(1 + r, n) - 1) / r))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <p className="text-xs text-muted-foreground mb-1">Annual tax saving</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {fmt(taxSaving + employeeTaxSaving, currency)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-center">
          <p className="text-xs text-muted-foreground mb-1">Corpus in {years}y</p>
          <p className="text-xl font-bold text-primary">{fmtShort(corpus)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Employer NPS %</span>
          <span className="font-medium">{employerPct}% of basic ({fmt(employerAnnual, currency)}/yr)</span>
        </div>
        <Slider min={0} max={14} step={1} value={[employerPct]}
          onValueChange={(v) => setEmployerPct(Array.isArray(v) ? v[0] : v)} />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Your NPS contribution</span>
          <span className="font-medium">{employeePct}% of basic</span>
        </div>
        <Slider min={0} max={20} step={1} value={[employeePct]}
          onValueChange={(v) => setEmployeePct(Array.isArray(v) ? v[0] : v)} />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Investment horizon</span>
          <span className="font-medium">{years} years</span>
        </div>
        <Slider min={5} max={35} step={1} value={[years]}
          onValueChange={(v) => setYears(Array.isArray(v) ? v[0] : v)} />
      </div>

      <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
        <div className="flex justify-between">
          <span>Employer NPS (u/s 80CCD(2))</span><span>{fmt(actualDeduction, currency)} deductible</span>
        </div>
        <div className="flex justify-between">
          <span>→ Tax saved</span><span className="text-green-600">{fmt(taxSaving, currency)}</span>
        </div>
        {salaryData?.taxRegime === 'old' && (
          <>
            <div className="flex justify-between">
              <span>Your NPS (u/s 80CCD(1B))</span><span>{fmt(employeeDeduction, currency)} deductible</span>
            </div>
            <div className="flex justify-between">
              <span>→ Tax saved</span><span className="text-green-600">{fmt(employeeTaxSaving, currency)}</span>
            </div>
          </>
        )}
        {salaryData?.taxRegime !== 'old' && (
          <p className="text-amber-600 dark:text-amber-400">
            80CCD(1B) employee deduction not available in new regime.
          </p>
        )}
        <div className="flex justify-between font-medium text-foreground border-t border-border pt-1 mt-1">
          <span>Total monthly into NPS</span><span>{fmt(Math.round(totalMonthly), currency)}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Corpus assumes 10% CAGR. At maturity, 60% tax-free; 40% goes to annuity.</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BenefitsCalculator() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Benefits Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="espp">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="espp" className="flex-1">ESPP</TabsTrigger>
            <TabsTrigger value="nps" className="flex-1">NPS</TabsTrigger>
          </TabsList>
          <TabsContent value="espp"><ESPPTab /></TabsContent>
          <TabsContent value="nps"><NPSTab /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
