import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Lightbulb, Target } from "lucide-react"

async function getInsights() {
  return {
    topPerforming: [
      { niche: "Weight Loss Guides", growth: 27, score: 89 },
      { niche: "Keto Cookbooks", growth: 18, score: 84 },
      { niche: "Mindfulness Books", growth: 15, score: 76 },
    ],
    aiInsights: [
      {
        type: "opportunity",
        title: "Low Competition Alert",
        description: "Mindfulness Coloring Books rising 27% in past 90 days with low competition.",
        priority: "high",
      },
      {
        type: "trend",
        title: "Price Increase Detected",
        description: "Average price in Minimalist Planners increased 12% - consider entering now.",
        priority: "medium",
      },
      {
        type: "warning",
        title: "Market Saturation",
        description: "Dog Training niche showing signs of oversaturation with 67 new books this month.",
        priority: "low",
      },
    ],
  }
}

export async function InsightsSidebar() {
  const insights = await getInsights()

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return Lightbulb
      case "trend":
        return TrendingUp
      case "warning":
        return AlertTriangle
      default:
        return Target
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "text-lime-600"
      case "trend":
        return "text-cyan-600"
      case "warning":
        return "text-orange-600"
      default:
        return "text-slate-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Performing Niches */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Top Performing Niches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.topPerforming.map((niche, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900 text-sm">{niche.niche}</div>
                <div className="text-xs text-lime-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />+{niche.growth}% growth
                </div>
              </div>
              <Badge className="bg-lime-100 text-lime-800">{niche.score}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Insights Feed */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">AI Insights</CardTitle>
          <p className="text-xs text-slate-600">Real-time market intelligence</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.aiInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            return (
              <div key={index} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className={`h-4 w-4 mr-2 ${getInsightColor(insight.type)}`} />
                    <span className="font-medium text-slate-900 text-sm">{insight.title}</span>
                  </div>
                  <Badge className={getPriorityColor(insight.priority)} variant="secondary">
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-cyan-50 to-lime-50 border-cyan-200">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-800">1,247</div>
            <div className="text-sm text-cyan-600">Niches Analyzed</div>
            <div className="text-xs text-slate-500 mt-2">Last updated: 2 hours ago</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
