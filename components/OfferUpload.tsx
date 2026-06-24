'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, Check, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSalaryStore } from '@/hooks/useSalaryStore'
import type { SalaryData } from '@/types/salary'

const DEMO: SalaryData = {
  currency: 'INR',
  ctc: 3500000,
  basePay: 1800000,
  basic: 900000,
  hra: 450000,
  flexiBenefit: 200000,
  conveyance: 24000,
  companyPF: 108000,
  gratuity: 43290,
  variablePay: 350000,
  joiningBonus: 200000,
  joiningBonusClawbackMonths: 12,
  country: 'IN',
  taxRegime: 'new',
}

export default function OfferUpload() {
  const { salaryData, setSalary } = useSalaryStore()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Manual form state
  const [form, setForm] = useState({
    currency: 'INR',
    country: 'IN',
    ctc: '',
    basePay: '',
    basic: '',
    hra: '',
    variablePay: '',
    joiningBonus: '',
    companyPF: '',
    gratuity: '',
    taxRegime: 'new' as 'new' | 'old',
  })

  async function handleFile(file: File) {
    if (!file.name.endsWith('.pdf')) { setError('Please upload a PDF file'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return }
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/parse-offer', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Parse failed')
      const data: SalaryData = await res.json()
      setSalary(data)
    } catch {
      setError('Could not parse PDF. Try entering details manually.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = (v: string) => parseFloat(v.replace(/,/g, '')) || 0
    setSalary({
      currency: form.currency,
      country: form.country,
      ctc: n(form.ctc),
      basePay: n(form.basePay),
      basic: n(form.basic),
      hra: n(form.hra),
      variablePay: n(form.variablePay) || undefined,
      joiningBonus: n(form.joiningBonus) || undefined,
      companyPF: n(form.companyPF) || undefined,
      gratuity: n(form.gratuity) || undefined,
      taxRegime: form.taxRegime,
    })
  }

  if (salaryData) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check size={18} />
            <span className="text-sm font-medium">Offer loaded · {salaryData.currency} {(salaryData.ctc / 100000).toFixed(1)}L CTC</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => useSalaryStore.getState().reset()}>
            Change
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Load your offer</CardTitle>
        <p className="text-xs text-muted-foreground">PDF text is sent to AI for extraction — not stored on our servers.</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="manual">Enter manually</TabsTrigger>
            <TabsTrigger value="demo">Try demo</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              {uploading ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Extracting salary details…</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Drop your offer letter PDF here</p>
                  <p className="text-xs text-muted-foreground">or click to browse · max 10MB</p>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="INR" />
                </div>
                <div>
                  <Label>Country (ISO)</Label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="IN" />
                </div>
              </div>
              {[
                { key: 'ctc', label: 'Annual CTC *' },
                { key: 'basePay', label: 'Base Pay *' },
                { key: 'basic', label: 'Basic *' },
                { key: 'hra', label: 'HRA *' },
                { key: 'variablePay', label: 'Variable Pay' },
                { key: 'joiningBonus', label: 'Joining Bonus' },
                { key: 'companyPF', label: 'Company PF (annual)' },
                { key: 'gratuity', label: 'Gratuity (annual)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder="0"
                  />
                </div>
              ))}
              <div>
                <Label>Tax Regime</Label>
                <select
                  value={form.taxRegime}
                  onChange={(e) => setForm({ ...form, taxRegime: e.target.value as 'new' | 'old' })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="new">New (default FY25-26)</option>
                  <option value="old">Old</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Calculate my breakdown</Button>
            </form>
          </TabsContent>

          <TabsContent value="demo">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-1">
                <p className="font-medium">Sample: Bangalore SWE, ~35 LPA</p>
                <p className="text-muted-foreground">CTC ₹35L · Basic ₹9L · HRA ₹4.5L · Variable ₹3.5L · Joining Bonus ₹2L</p>
              </div>
              <Button onClick={() => setSalary(DEMO)} className="w-full">
                <FileText size={14} className="mr-2" /> Load demo offer
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
