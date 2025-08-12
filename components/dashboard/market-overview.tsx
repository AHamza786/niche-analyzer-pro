import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"

async function getMarketOverview() {
  // In a real app, this would fetch from your API
  return {
    avgBSR: 125000,
    avgPrice: 12.99,
    monthlySales: 45000,
    competitionLevel: 68,
    trends: {
      bsr: 12,
      price: -5,
      sales: 23,
      competition: -8,
    },
  }
}

export async function MarketOverview() {
  const data = await getMarketOverview()

  const metrics = [
    {
      title: "Avg BSR",
      value: data.avgBSR.toLocaleString(),
      trend: data.trends.bsr,
      icon: Target,
      color: "text-cyan-600",
    },
    {
      title: "Avg Price",
      value: `$${data.avgPrice}`,
      trend: data.trends.price,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Monthly Sales",
      value: data.monthlySales.toLocaleString(),
      trend: data.trends.sales,
      icon: TrendingUp,
      color: "text-lime-600",
    },
    {
      title: "Competition Level",
      value: `${data.competitionLevel}%`,
      trend: data.trends.competition,
      icon: TrendingDown,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 uppercase tracking-wide">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              {metric.trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-lime-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={metric.trend > 0 ? "text-lime-600" : "text-red-600"}>
                {Math.abs(metric.trend)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
