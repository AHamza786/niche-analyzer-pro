// BSR to daily sales conversion based on industry estimates
export function calculateBSRToSales(bsr: number): number {
  if (bsr <= 100) return 300 + (100 - bsr) * 5
  if (bsr <= 1000) return 50 + (1000 - bsr) * 0.25
  if (bsr <= 10000) return 10 + (10000 - bsr) * 0.004
  if (bsr <= 100000) return 2 + (100000 - bsr) * 0.00008
  if (bsr <= 500000) return 1 + (500000 - bsr) * 0.000002
  return Math.max(0.1, 1 - (bsr - 500000) * 0.000001)
}

interface OpportunityFactors {
  totalSales: number
  selfPubPercentage: number
  successRate: number
  newPublications: number
  avgBSR: number
}

export function calculateOpportunityScore(factors: OpportunityFactors): number {
  const { totalSales, selfPubPercentage, successRate, newPublications, avgBSR } = factors

  // Demand score (0-30 points)
  let demandScore = 0
  if (totalSales > 50000) demandScore = 30
  else if (totalSales > 20000) demandScore = 25
  else if (totalSales > 10000) demandScore = 20
  else if (totalSales > 5000) demandScore = 15
  else if (totalSales > 1000) demandScore = 10
  else demandScore = 5

  // Competition score (0-25 points) - lower competition is better
  let competitionScore = 0
  if (avgBSR > 500000) competitionScore = 25
  else if (avgBSR > 200000) competitionScore = 20
  else if (avgBSR > 100000) competitionScore = 15
  else if (avgBSR > 50000) competitionScore = 10
  else competitionScore = 5

  // Self-pub opportunity (0-20 points)
  let selfPubScore = 0
  if (selfPubPercentage > 80) selfPubScore = 20
  else if (selfPubPercentage > 60) selfPubScore = 16
  else if (selfPubPercentage > 40) selfPubScore = 12
  else if (selfPubPercentage > 20) selfPubScore = 8
  else selfPubScore = 4

  // Success rate (0-15 points)
  let successScore = 0
  if (successRate > 80) successScore = 15
  else if (successRate > 60) successScore = 12
  else if (successRate > 40) successScore = 9
  else if (successRate > 20) successScore = 6
  else successScore = 3

  // Market saturation penalty (0-10 points) - fewer new publications is better
  let saturationScore = 0
  if (newPublications < 10) saturationScore = 10
  else if (newPublications < 20) saturationScore = 8
  else if (newPublications < 40) saturationScore = 6
  else if (newPublications < 60) saturationScore = 4
  else saturationScore = 2

  const totalScore = demandScore + competitionScore + selfPubScore + successScore + saturationScore

  // Convert to 0-100 scale
  return Math.min(100, Math.max(0, totalScore))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}
