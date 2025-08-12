import { calculationEngine } from "./calculation-engine"
import { createServerClient } from "@/lib/supabase/server"

interface MarketInsight {
  type: "opportunity" | "warning" | "trend" | "seasonal"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  actionable: boolean
}

interface MarketReport {
  keyword: string
  overallScore: number
  insights: MarketInsight[]
  recommendations: string[]
  competitorAnalysis: {
    mainCompetitors: string[]
    weaknesses: string[]
    opportunities: string[]
  }
}

export class MarketAnalyzer {
  private supabase = createServerClient()

  async generateMarketReport(keywordId: string, keywordName: string): Promise<MarketReport> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    // Get keyword metrics
    const { data: metrics, error } = await this.supabase
      .from("keyword_metrics")
      .select("*")
      .eq("keyword_id", keywordId)
      .single()

    if (error || !metrics) {
      throw new Error("Keyword metrics not found")
    }

    // Analyze trends and competition
    const [trendAnalysis, competitionAnalysis] = await Promise.all([
      calculationEngine.analyzeTrends(keywordId),
      calculationEngine.analyzeCompetition(keywordId),
    ])

    const seasonalFactors = calculationEngine.calculateSeasonalFactors(keywordName)
    const roiAnalysis = calculationEngine.calculateROI(metrics)

    // Generate insights
    const insights: MarketInsight[] = []

    // Opportunity insights
    if (metrics.opportunity_score > 80) {
      insights.push({
        type: "opportunity",
        title: "High Opportunity Market",
        description: `This keyword shows excellent potential with a ${metrics.opportunity_score}% opportunity score.`,
        impact: "high",
        actionable: true,
      })
    }

    if (metrics.self_pub_percentage > 75) {
      insights.push({
        type: "opportunity",
        title: "Self-Publisher Friendly",
        description: `${metrics.self_pub_percentage}% of successful books are self-published, indicating good opportunities for independent authors.`,
        impact: "high",
        actionable: true,
      })
    }

    // Warning insights
    if (competitionAnalysis.level === "high") {
      insights.push({
        type: "warning",
        title: "High Competition Detected",
        description: `Competition score of ${competitionAnalysis.score}% suggests this market may be challenging for new entrants.`,
        impact: "high",
        actionable: true,
      })
    }

    if (metrics.new_publications_30d > 50) {
      insights.push({
        type: "warning",
        title: "Market Saturation Risk",
        description: `${metrics.new_publications_30d} new books published in the last 30 days indicates potential oversaturation.`,
        impact: "medium",
        actionable: true,
      })
    }

    // Trend insights
    if (trendAnalysis.direction === "rising" && trendAnalysis.confidence > 70) {
      insights.push({
        type: "trend",
        title: "Growing Market Demand",
        description: `Sales trend is ${trendAnalysis.direction} with ${trendAnalysis.monthlyChange}% monthly growth and ${trendAnalysis.confidence}% confidence.`,
        impact: "high",
        actionable: true,
      })
    }

    // Seasonal insights
    if (seasonalFactors.volatility > 0.4) {
      const currentMonth = new Date().getMonth()
      const isPeakSeason = seasonalFactors.peakMonths.includes(currentMonth)

      insights.push({
        type: "seasonal",
        title: isPeakSeason ? "Peak Season Active" : "Seasonal Market Detected",
        description: `This market shows ${Math.round(seasonalFactors.volatility * 100)}% seasonal volatility. ${isPeakSeason ? "Currently in peak season." : "Consider timing your launch for peak months."}`,
        impact: "medium",
        actionable: true,
      })
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (metrics.opportunity_score > 70) {
      recommendations.push("Consider entering this market - strong opportunity indicators")
    }

    if (competitionAnalysis.level === "low") {
      recommendations.push("Low competition detected - good timing for market entry")
    }

    if (roiAnalysis.breakEvenMonths < 12) {
      recommendations.push(`Fast ROI potential - estimated ${roiAnalysis.breakEvenMonths} months to break even`)
    }

    if (seasonalFactors.peakMonths.length > 0) {
      const peakMonthNames = seasonalFactors.peakMonths
        .map((m) => new Date(2024, m, 1).toLocaleString("default", { month: "long" }))
        .join(", ")
      recommendations.push(`Time your launch for peak months: ${peakMonthNames}`)
    }

    if (metrics.success_rate > 60) {
      recommendations.push(`High success rate (${metrics.success_rate}%) - good market for quality content`)
    }

    // Competitor analysis
    const competitorAnalysis = {
      mainCompetitors: competitionAnalysis.topPublishers.slice(0, 3),
      weaknesses: this.identifyCompetitorWeaknesses(competitionAnalysis),
      opportunities: this.identifyMarketOpportunities(metrics, competitionAnalysis),
    }

    // Calculate overall score
    const overallScore = Math.round(
      metrics.opportunity_score * 0.4 +
        metrics.success_rate * 0.3 +
        competitionAnalysis.score * 0.2 +
        trendAnalysis.strength * 0.1,
    )

    return {
      keyword: keywordName,
      overallScore,
      insights,
      recommendations,
      competitorAnalysis,
    }
  }

  private identifyCompetitorWeaknesses(competition: any): string[] {
    const weaknesses: string[] = []

    if (competition.score > 60) {
      weaknesses.push("Low competition from major publishers")
    }

    if (competition.avgTimeToRank < 120) {
      weaknesses.push("Fast ranking potential for quality content")
    }

    const independentShare = competition.marketShare["Independent"] || 0
    if (independentShare > 30) {
      weaknesses.push("Market dominated by independent publishers")
    }

    return weaknesses
  }

  private identifyMarketOpportunities(metrics: any, competition: any): string[] {
    const opportunities: string[] = []

    if (metrics.total_sales > 20000 && competition.level !== "high") {
      opportunities.push("High demand with manageable competition")
    }

    if (metrics.self_pub_percentage > 70) {
      opportunities.push("Self-publishing success stories abundant")
    }

    if (metrics.new_publications_30d < 20) {
      opportunities.push("Undersaturated market with room for growth")
    }

    return opportunities
  }
}

// Export singleton instance
export const marketAnalyzer = new MarketAnalyzer()
