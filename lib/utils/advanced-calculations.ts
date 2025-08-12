// Advanced calculation utilities for KDP analysis

export interface ProfitProjection {
  month: number
  sales: number
  revenue: number
  profit: number
  cumulativeProfit: number
}

export function calculateProfitProjections(
  initialSales: number,
  bookPrice: number,
  royaltyRate = 0.35,
  growthRate = 0.05,
  marketingCost = 100,
  months = 12,
): ProfitProjection[] {
  const projections: ProfitProjection[] = []
  let cumulativeProfit = 0

  for (let month = 1; month <= months; month++) {
    const sales = Math.round(initialSales * Math.pow(1 + growthRate, month - 1))
    const revenue = sales * bookPrice * royaltyRate
    const profit = revenue - marketingCost
    cumulativeProfit += profit

    projections.push({
      month,
      sales,
      revenue: Math.round(revenue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
    })
  }

  return projections
}

export function calculateMarketSaturation(
  totalBooks: number,
  newBooks30d: number,
  totalSales: number,
): {
  saturationLevel: "low" | "medium" | "high"
  score: number
  booksPerSale: number
  recommendation: string
} {
  const booksPerSale = totalSales > 0 ? totalBooks / totalSales : 999
  const newBookRate = (newBooks30d / 30) * 365 // Annualized new book rate

  let score = 0

  // Factor 1: Books per sale ratio
  if (booksPerSale < 0.01) score += 30
  else if (booksPerSale < 0.05) score += 20
  else if (booksPerSale < 0.1) score += 10

  // Factor 2: New book publication rate
  if (newBookRate < 100) score += 30
  else if (newBookRate < 300) score += 20
  else if (newBookRate < 500) score += 10

  // Factor 3: Total market size
  if (totalBooks < 500) score += 40
  else if (totalBooks < 1000) score += 30
  else if (totalBooks < 2000) score += 20
  else if (totalBooks < 5000) score += 10

  let saturationLevel: "low" | "medium" | "high"
  let recommendation: string

  if (score >= 70) {
    saturationLevel = "low"
    recommendation = "Excellent opportunity - low saturation market"
  } else if (score >= 40) {
    saturationLevel = "medium"
    recommendation = "Moderate opportunity - balanced market conditions"
  } else {
    saturationLevel = "high"
    recommendation = "Challenging market - high saturation detected"
  }

  return {
    saturationLevel,
    score,
    booksPerSale: Math.round(booksPerSale * 1000) / 1000,
    recommendation,
  }
}

export function calculateCompetitiveAdvantage(
  yourMetrics: {
    price: number
    reviewCount: number
    contentQuality: number // 1-10 scale
    marketingBudget: number
  },
  marketAverages: {
    avgPrice: number
    avgReviews: number
    avgQuality: number
  },
): {
  advantages: string[]
  disadvantages: string[]
  overallScore: number
  recommendations: string[]
} {
  const advantages: string[] = []
  const disadvantages: string[] = []
  const recommendations: string[] = []
  let score = 50 // Start neutral

  // Price analysis
  if (yourMetrics.price < marketAverages.avgPrice * 0.8) {
    advantages.push("Competitive pricing advantage")
    score += 15
  } else if (yourMetrics.price > marketAverages.avgPrice * 1.2) {
    disadvantages.push("Higher than average pricing")
    score -= 10
    recommendations.push("Consider competitive pricing strategy")
  }

  // Review analysis
  if (yourMetrics.reviewCount > marketAverages.avgReviews * 1.5) {
    advantages.push("Strong social proof with high review count")
    score += 20
  } else if (yourMetrics.reviewCount < marketAverages.avgReviews * 0.5) {
    disadvantages.push("Below average review count")
    score -= 15
    recommendations.push("Focus on review acquisition strategy")
  }

  // Content quality analysis
  if (yourMetrics.contentQuality > marketAverages.avgQuality + 1) {
    advantages.push("Superior content quality")
    score += 25
  } else if (yourMetrics.contentQuality < marketAverages.avgQuality - 1) {
    disadvantages.push("Content quality below market standard")
    score -= 20
    recommendations.push("Invest in content improvement")
  }

  // Marketing budget analysis
  if (yourMetrics.marketingBudget > 500) {
    advantages.push("Strong marketing budget for promotion")
    score += 10
  } else if (yourMetrics.marketingBudget < 100) {
    disadvantages.push("Limited marketing budget")
    score -= 5
    recommendations.push("Consider increasing marketing investment")
  }

  return {
    advantages,
    disadvantages,
    overallScore: Math.max(0, Math.min(100, score)),
    recommendations,
  }
}

export function calculateOptimalLaunchTiming(
  seasonalFactors: { peakMonths: number[]; lowMonths: number[]; volatility: number },
  competitionTrends: { newPublications: number[]; months: string[] },
  currentMonth: number = new Date().getMonth(),
): {
  bestLaunchMonth: number
  worstLaunchMonth: number
  reasoning: string
  urgency: "high" | "medium" | "low"
} {
  const monthScores: { [month: number]: number } = {}

  // Initialize all months with base score
  for (let i = 0; i < 12; i++) {
    monthScores[i] = 50
  }

  // Apply seasonal factors
  seasonalFactors.peakMonths.forEach((month) => {
    monthScores[month] += 30 * seasonalFactors.volatility
  })

  seasonalFactors.lowMonths.forEach((month) => {
    monthScores[month] -= 20 * seasonalFactors.volatility
  })

  // Apply competition factors (fewer new publications = better)
  competitionTrends.newPublications.forEach((pubs, index) => {
    const month = index
    if (pubs < 20) monthScores[month] += 15
    else if (pubs > 50) monthScores[month] -= 15
  })

  // Find best and worst months
  const bestMonth = Object.entries(monthScores).reduce((a, b) =>
    monthScores[Number.parseInt(a[0])] > monthScores[Number.parseInt(b[0])] ? a : b,
  )[0]

  const worstMonth = Object.entries(monthScores).reduce((a, b) =>
    monthScores[Number.parseInt(a[0])] < monthScores[Number.parseInt(b[0])] ? a : b,
  )[0]

  // Calculate urgency based on current timing
  const currentScore = monthScores[currentMonth]
  const bestScore = monthScores[Number.parseInt(bestMonth)]
  const scoreDiff = bestScore - currentScore

  let urgency: "high" | "medium" | "low"
  if (scoreDiff > 30) urgency = "high"
  else if (scoreDiff > 15) urgency = "medium"
  else urgency = "low"

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const reasoning = `${monthNames[Number.parseInt(bestMonth)]} shows optimal conditions with seasonal advantages and lower competition. Current timing scores ${currentScore}/100 vs optimal ${bestScore}/100.`

  return {
    bestLaunchMonth: Number.parseInt(bestMonth),
    worstLaunchMonth: Number.parseInt(worstMonth),
    reasoning,
    urgency,
  }
}
