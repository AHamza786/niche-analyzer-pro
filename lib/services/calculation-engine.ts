import { createServerClient } from "@/lib/supabase/server"
import { calculateBSRToSales } from "@/lib/utils/calculations"
import type { KeywordMetrics } from "@/lib/types/kdp"

interface TrendAnalysis {
  direction: "rising" | "stable" | "declining"
  strength: number // 0-100
  confidence: number // 0-100
  monthlyChange: number
}

interface CompetitionAnalysis {
  level: "low" | "medium" | "high"
  score: number // 0-100
  topPublishers: string[]
  marketShare: { [publisher: string]: number }
  avgTimeToRank: number
}

interface SeasonalFactors {
  currentMultiplier: number
  peakMonths: number[]
  lowMonths: number[]
  volatility: number
}

export class CalculationEngine {
  private supabase = createServerClient()

  async analyzeTrends(keywordId: string, days = 90): Promise<TrendAnalysis> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    // Get historical BSR data
    const { data: history, error } = await this.supabase
      .from("bsr_history")
      .select(`
        *,
        books!inner(keyword_id)
      `)
      .eq("books.keyword_id", keywordId)
      .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("date", { ascending: true })

    if (error || !history?.length) {
      // Return default analysis if no historical data
      return {
        direction: "stable",
        strength: 50,
        confidence: 30,
        monthlyChange: 0,
      }
    }

    // Calculate trend using linear regression
    const dataPoints = history.map((point, index) => ({
      x: index,
      y: calculateBSRToSales(point.bsr),
    }))

    const { slope, rSquared } = this.linearRegression(dataPoints)
    const avgSales = dataPoints.reduce((sum, point) => sum + point.y, 0) / dataPoints.length
    const monthlyChange = ((slope * 30) / avgSales) * 100 // Convert to monthly percentage change

    return {
      direction: slope > 0.1 ? "rising" : slope < -0.1 ? "declining" : "stable",
      strength: Math.min(100, Math.abs(slope * 1000)),
      confidence: Math.min(100, rSquared * 100),
      monthlyChange: Math.round(monthlyChange * 100) / 100,
    }
  }

  async analyzeCompetition(keywordId: string): Promise<CompetitionAnalysis> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    const { data: books, error } = await this.supabase
      .from("books")
      .select("*")
      .eq("keyword_id", keywordId)
      .order("current_bsr", { ascending: true })

    if (error || !books?.length) {
      return {
        level: "medium",
        score: 50,
        topPublishers: [],
        marketShare: {},
        avgTimeToRank: 180,
      }
    }

    // Analyze publisher distribution
    const publisherCounts: { [key: string]: number } = {}
    const publisherSales: { [key: string]: number } = {}

    books.forEach((book) => {
      const publisher = book.publisher || "Unknown"
      publisherCounts[publisher] = (publisherCounts[publisher] || 0) + 1
      publisherSales[publisher] = (publisherSales[publisher] || 0) + calculateBSRToSales(book.current_bsr || 1000000)
    })

    const totalSales = Object.values(publisherSales).reduce((sum, sales) => sum + sales, 0)
    const marketShare: { [key: string]: number } = {}

    Object.entries(publisherSales).forEach(([publisher, sales]) => {
      marketShare[publisher] = Math.round((sales / totalSales) * 10000) / 100
    })

    const topPublishers = Object.entries(publisherSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([publisher]) => publisher)

    // Calculate competition score
    const top10Books = books.slice(0, 10)
    const avgBSR = top10Books.reduce((sum, book) => sum + (book.current_bsr || 1000000), 0) / top10Books.length
    const independentInTop10 = top10Books.filter(
      (book) =>
        book.publisher?.includes("Independent") ||
        book.publisher?.includes("Self") ||
        book.publisher === "CreateSpace Independent",
    ).length

    let competitionScore = 0
    if (avgBSR > 500000) competitionScore += 30
    else if (avgBSR > 100000) competitionScore += 20
    else if (avgBSR > 50000) competitionScore += 10

    competitionScore += (independentInTop10 / 10) * 40 // More independents = less competition
    competitionScore += Math.min(30, (books.length / 100) * 30) // More books = more competition (inverse)

    return {
      level: competitionScore > 70 ? "low" : competitionScore > 40 ? "medium" : "high",
      score: Math.round(competitionScore),
      topPublishers,
      marketShare,
      avgTimeToRank: this.estimateTimeToRank(avgBSR, independentInTop10),
    }
  }

  calculateSeasonalFactors(keyword: string): SeasonalFactors {
    const currentMonth = new Date().getMonth()

    // Define seasonal patterns for different niches
    const seasonalPatterns: { [key: string]: { peak: number[]; low: number[]; volatility: number } } = {
      "weight loss": { peak: [0, 1, 11], low: [5, 6, 7], volatility: 0.4 },
      diet: { peak: [0, 1, 11], low: [5, 6, 7], volatility: 0.4 },
      fitness: { peak: [0, 1, 4], low: [10, 11], volatility: 0.3 },
      cookbook: { peak: [10, 11, 0], low: [6, 7, 8], volatility: 0.2 },
      christmas: { peak: [10, 11], low: [1, 2, 3, 4, 5, 6, 7, 8, 9], volatility: 0.8 },
      summer: { peak: [4, 5, 6], low: [11, 0, 1], volatility: 0.5 },
      business: { peak: [0, 8, 9], low: [6, 7, 11], volatility: 0.2 },
      "self help": { peak: [0, 1], low: [6, 7], volatility: 0.3 },
    }

    // Find matching pattern
    let pattern = { peak: [0, 1], low: [6, 7], volatility: 0.2 } // default

    for (const [niche, nichemPattern] of Object.entries(seasonalPatterns)) {
      if (keyword.toLowerCase().includes(niche)) {
        pattern = nichemPattern
        break
      }
    }

    // Calculate current multiplier
    let multiplier = 1.0
    if (pattern.peak.includes(currentMonth)) {
      multiplier = 1.0 + pattern.volatility * 0.5
    } else if (pattern.low.includes(currentMonth)) {
      multiplier = 1.0 - pattern.volatility * 0.3
    }

    return {
      currentMultiplier: Math.round(multiplier * 100) / 100,
      peakMonths: pattern.peak,
      lowMonths: pattern.low,
      volatility: pattern.volatility,
    }
  }

  calculateROI(
    metrics: KeywordMetrics,
    investmentCost = 2000,
  ): {
    monthlyROI: number
    breakEvenMonths: number
    yearlyProfit: number
    riskLevel: "low" | "medium" | "high"
  } {
    const monthlyRevenue = metrics.royalties
    const monthlyProfit = monthlyRevenue - investmentCost * 0.05 // 5% monthly amortization
    const monthlyROI = (monthlyProfit / investmentCost) * 100
    const breakEvenMonths = monthlyRevenue > 0 ? investmentCost / monthlyRevenue : 999
    const yearlyProfit = monthlyProfit * 12

    let riskLevel: "low" | "medium" | "high" = "medium"
    if (metrics.opportunity_score > 75 && metrics.success_rate > 70) riskLevel = "low"
    else if (metrics.opportunity_score < 40 || metrics.success_rate < 30) riskLevel = "high"

    return {
      monthlyROI: Math.round(monthlyROI * 100) / 100,
      breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
      yearlyProfit: Math.round(yearlyProfit),
      riskLevel,
    }
  }

  private linearRegression(points: { x: number; y: number }[]): { slope: number; rSquared: number } {
    const n = points.length
    if (n < 2) return { slope: 0, rSquared: 0 }

    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0)
    const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R-squared
    const yMean = sumY / n
    const ssRes = points.reduce((sum, p) => {
      const predicted = slope * p.x + intercept
      return sum + Math.pow(p.y - predicted, 2)
    }, 0)
    const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0)
    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0

    return { slope, rSquared: Math.max(0, rSquared) }
  }

  private estimateTimeToRank(avgBSR: number, independentCount: number): number {
    let baseTime = 180 // 6 months default

    if (avgBSR > 500000)
      baseTime = 90 // Low competition
    else if (avgBSR > 100000) baseTime = 120
    else if (avgBSR > 50000) baseTime = 150
    else baseTime = 240 // High competition

    // Adjust for independent publisher success
    const independentFactor = independentCount / 10
    baseTime = baseTime * (1 - independentFactor * 0.3)

    return Math.round(baseTime)
  }
}

// Export singleton instance
export const calculationEngine = new CalculationEngine()
