'use client'
import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSalaryStore } from '@/hooks/useSalaryStore'
import { estimateInHand, calcSurplus, projectWealth } from '@/lib/salaryCalc'

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

const MF_CAGR = 12
const PF_CAGR = 8.25

export default function WealthProjection() {
  const { salaryData, budgetItems } = useSalaryStore()

  const data = useMemo(() => {
    const inHand = salaryData ? estimateInHand(salaryData) : 80000
    const surplus = calcSurplus(inHand, budgetItems)
    const mfSIP = budgetItems.find((b) => b.label === 'Investments / MF SIP')?.amount ?? 10000
    const surplusInvest = Math.max(0, surplus - mfSIP)

    const annualPF = salaryData?.companyPF
      ? (salaryData.basic * 0.12 + salaryData.companyPF) / 12
      : 0

    return Array.from({ length: 11 }, (_, i) => {
      const year = i
      const mf = projectWealth(mfSIP, year, MF_CAGR)
      const mfPlusPF = mf + projectWealth(annualPF, year, PF_CAGR)
      const total = mfPlusPF + projectWealth(surplusInvest, year, MF_CAGR)
      return { year: `Y${year}`, mf, 'MF + PF': mfPlusPF, Total: total }
    })
  }, [salaryData, budgetItems])

  const year3Total = data[3]?.Total ?? 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Wealth Projection</CardTitle>
        <p className="text-sm text-muted-foreground">
          Year 3 corpus: <span className="font-semibold text-primary">{fmt(year3Total)}</span>
          {year3Total >= 500000 && ' — potential home loan down payment'}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} width={60} />
            <Tooltip formatter={(v) => fmt(Number(v))} />
            <Legend />
            <ReferenceLine x="Y3" stroke="hsl(var(--primary))" strokeDasharray="4 4" label={{ value: 'Y3', position: 'top', fontSize: 11 }} />
            <Line type="monotone" dataKey="mf" name="MF SIP" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="MF + PF" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Total" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
          <span>MF CAGR: {MF_CAGR}%</span>
          <span>PF rate: {PF_CAGR}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
