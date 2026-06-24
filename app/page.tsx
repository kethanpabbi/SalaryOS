import Link from 'next/link'
import { ArrowRight, FileText, BarChart3, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground">
          No account required · Data stays in your browser
        </div>

        <h1 className="text-5xl font-bold tracking-tight">
          Know your offer.<br />
          <span className="text-primary">Own your money.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Upload your offer letter or enter salary details manually — get an instant breakdown, live budget planner, wealth projection, and an AI assistant grounded in your actual numbers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/planner">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <FileText size={16} /> Upload offer letter
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/planner">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Enter manually
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 text-left">
          {[
            { icon: FileText, title: 'Instant breakdown', desc: 'See gross pay, in-hand estimate, tax deductions, and every component at a glance.' },
            { icon: BarChart3, title: 'Budget & wealth planner', desc: 'Slide rent, EMIs, and investments to see your savings rate and 10-year wealth projection update live.' },
            { icon: MessageCircle, title: 'AI financial assistant', desc: 'Ask "is this a good offer?" or "how much home loan can I afford?" — grounded in your real numbers.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl border border-border bg-card">
              <Icon size={20} className="text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
