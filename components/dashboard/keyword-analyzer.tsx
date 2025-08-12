"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, TrendingUp, Users, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalysisResult {
  keyword: string
  opportunityScore: number
  totalSales: number
  competition: string
  avgPrice: number
  trend: string
  insights: string[]
}

export function KeywordAnalyzer() {
  const [keyword, setKeyword] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const { toast } = useToast()

  const analyzeKeyword = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword to analyze",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // First create the keyword
      const createResponse = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyword.trim() }),
      })

      let keywordData
      if (createResponse.status === 409) {
        // Keyword exists, fetch it
        const existingResponse = await fetch("/api/keywords")
        const existingData = await existingResponse.json()
        keywordData = existingData.keywords.find((k: any) => k.name.toLowerCase() === keyword.trim().toLowerCase())
      } else if (createResponse.ok) {
        const createData = await createResponse.json()
        keywordData = createData.keyword
      } else {
        throw new Error("Failed to create keyword")
      }

      if (!keywordData) {
        throw new Error("Keyword not found")
      }

      // Analyze the keyword
      const analyzeResponse = await fetch(`/api/keywords/${keywordData.id}/analyze`, {
        method: "POST",
      })

      if (!analyzeResponse.ok) {
        throw new Error("Analysis failed")
      }

      const analysisData = await analyzeResponse.json()

      // Transform the data for display
      setResult({
        keyword: keyword.trim(),
        opportunityScore: analysisData.analysis.metrics.opportunity_score || 0,
        totalSales: analysisData.analysis.metrics.total_sales || 0,
        competition:
          analysisData.analysis.metrics.opportunity_score > 70
            ? "Low"
            : analysisData.analysis.metrics.opportunity_score > 40
              ? "Medium"
              : "High",
        avgPrice: analysisData.analysis.analysis.avgPrice || 0,
        trend: analysisData.analysis.metrics.demand_trend || "stable",
        insights: [
          `${analysisData.analysis.analysis.totalBooks} books found in this niche`,
          `${analysisData.analysis.analysis.selfPubBooks} are self-published (${Math.round((analysisData.analysis.analysis.selfPubBooks / analysisData.analysis.analysis.totalBooks) * 100)}%)`,
          `${analysisData.analysis.analysis.topPerformers} books ranking under 50k BSR`,
        ],
      })

      toast({
        title: "Analysis Complete",
        description: `Found ${analysisData.analysis.analysis.totalBooks} books in "${keyword}" niche`,
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze keyword. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-lime-100 text-lime-800 border-lime-200"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getTrendIcon = (trend: string) => {
    return trend === "rising" ? TrendingUp : trend === "declining" ? TrendingUp : TrendingUp
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Keyword Analyzer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter keyword (e.g., 'weight loss for women')"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzeKeyword()}
              className="bg-slate-50 border-slate-200"
            />
          </div>
          <Button onClick={analyzeKeyword} disabled={isAnalyzing} className="bg-cyan-800 hover:bg-cyan-700">
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Analysis: "{result.keyword}"</h3>
              <Badge className={getScoreColor(result.opportunityScore)}>
                {result.opportunityScore}/100 Opportunity Score
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded border border-slate-200">
                <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm text-slate-600">Avg Price</div>
                <div className="text-lg font-bold text-slate-900">${result.avgPrice}</div>
              </div>

              <div className="text-center p-3 bg-white rounded border border-slate-200">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm text-slate-600">Monthly Sales</div>
                <div className="text-lg font-bold text-slate-900">{result.totalSales.toLocaleString()}</div>
              </div>

              <div className="text-center p-3 bg-white rounded border border-slate-200">
                <TrendingUp className="h-5 w-5 text-lime-600 mx-auto mb-1" />
                <div className="text-sm text-slate-600">Trend</div>
                <div className="text-lg font-bold text-slate-900 capitalize">{result.trend}</div>
              </div>

              <div className="text-center p-3 bg-white rounded border border-slate-200">
                <div className="text-sm text-slate-600">Competition</div>
                <div
                  className={`text-lg font-bold ${
                    result.competition === "Low"
                      ? "text-lime-600"
                      : result.competition === "Medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {result.competition}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Key Insights:</h4>
              <ul className="space-y-1">
                {result.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-slate-600 flex items-start">
                    <span className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
