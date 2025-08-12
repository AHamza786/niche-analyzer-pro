import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MarketOverview } from "@/components/dashboard/market-overview"
import { KeywordAnalyzer } from "@/components/dashboard/keyword-analyzer"
import { OpportunityTable } from "@/components/dashboard/opportunity-table"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { InsightsSidebar } from "@/components/dashboard/insights-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cyan-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-800 mb-2">Find Your Next Profitable Niche</h1>
          <p className="text-slate-600">Analyze Amazon KDP opportunities with data-driven insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <MarketOverview />
            </Suspense>

            <KeywordAnalyzer />

            <Suspense fallback={<LoadingSpinner />}>
              <TrendChart />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
              <OpportunityTable />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <InsightsSidebar />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
