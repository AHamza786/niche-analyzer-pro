import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"

async function getOpportunities() {
  // In a real app, this would fetch from your API
  return [
    {
      keyword: "weight loss for women",
      searchVolume: "12K",
      competition: 45,
      avgPrice: 14.99,
      topBSRs: [1250, 3400, 5670],
      opportunityScore: 87,
      trend: "rising",
    },
    {
      keyword: "keto diet cookbook",
      searchVolume: "8.5K",
      competition: 72,
      avgPrice: 16.99,
      topBSRs: [890, 2100, 4500],
      opportunityScore: 73,
      trend: "stable",
    },
    {
      keyword: "mindfulness meditation",
      searchVolume: "15K",
      competition: 68,
      avgPrice: 11.99,
      topBSRs: [2100, 4500, 7800],
      opportunityScore: 65,
      trend: "declining",
    },
    {
      keyword: "small business marketing",
      searchVolume: "6.2K",
      competition: 55,
      avgPrice: 19.99,
      topBSRs: [1800, 3200, 6100],
      opportunityScore: 78,
      trend: "rising",
    },
    {
      keyword: "dog training guide",
      searchVolume: "9.8K",
      competition: 62,
      avgPrice: 13.99,
      topBSRs: [1500, 2800, 5200],
      opportunityScore: 71,
      trend: "stable",
    },
  ]
}

export async function OpportunityTable() {
  const opportunities = await getOpportunities()

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-lime-100 text-lime-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    if (score >= 40) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  const getCompetitionColor = (competition: number) => {
    if (competition <= 40) return "text-lime-600"
    if (competition <= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Keyword Opportunities</CardTitle>
          <Button variant="outline" size="sm" className="text-slate-600 bg-transparent">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort by Score
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Keyword
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Search Volume
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Competition
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Avg Price
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Top 3 BSRs
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Opportunity Score
                </th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <span className="font-medium text-slate-900">{opportunity.keyword}</span>
                      {opportunity.trend === "rising" ? (
                        <TrendingUp className="h-3 w-3 text-lime-500 ml-2" />
                      ) : opportunity.trend === "declining" ? (
                        <TrendingDown className="h-3 w-3 text-red-500 ml-2" />
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-slate-600">{opportunity.searchVolume}</td>
                  <td className="py-4 px-2">
                    <span className={`font-medium ${getCompetitionColor(opportunity.competition)}`}>
                      {opportunity.competition}%
                    </span>
                  </td>
                  <td className="py-4 px-2 text-slate-900 font-medium">${opportunity.avgPrice}</td>
                  <td className="py-4 px-2">
                    <div className="flex space-x-1">
                      {opportunity.topBSRs.map((bsr, bsrIndex) => (
                        <span key={bsrIndex} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          #{bsr.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <Badge className={getScoreColor(opportunity.opportunityScore)}>
                      {opportunity.opportunityScore}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
