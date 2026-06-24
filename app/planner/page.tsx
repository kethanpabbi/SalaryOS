'use client'
import CompensationCard from '@/components/CompensationCard'
import BudgetPlanner from '@/components/BudgetPlanner'
import WealthProjection from '@/components/WealthProjection'
import ChatBot from '@/components/ChatBot'
import OfferUpload from '@/components/OfferUpload'

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-bold text-lg tracking-tight">SalaryOS</a>
        <span className="text-xs text-muted-foreground hidden sm:block">Data stays in your browser</span>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:flex lg:gap-6 lg:h-[calc(100vh-57px)]">
        {/* Left column */}
        <div className="lg:flex-1 lg:overflow-y-auto space-y-6 lg:pr-2">
          <OfferUpload />
          <CompensationCard />
          <BudgetPlanner />
          <WealthProjection />
        </div>

        {/* Right column — desktop chat */}
        <div className="hidden lg:flex lg:w-96 lg:flex-col">
          <ChatBot />
        </div>
      </div>

      {/* Mobile chat bottom sheet */}
      <div className="lg:hidden">
        <ChatBot />
      </div>
    </div>
  )
}
