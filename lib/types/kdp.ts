export interface Keyword {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  keyword_id: string
  asin: string
  title: string
  publisher?: string
  price?: number
  current_bsr?: number
  review_count: number
  publication_date?: string
  created_at: string
  updated_at: string
}

export interface BSRHistory {
  id: string
  book_id: string
  bsr: number
  date: string
  daily_sales?: number
  created_at: string
}

export interface KeywordMetrics {
  id: string
  keyword_id: string
  total_sales: number
  self_pub_sales: number
  demand_trend: "rising" | "stable" | "declining"
  royalties: number
  new_publications_30d: number
  supply_trend: "rising" | "stable" | "declining"
  success_rate: number
  self_pub_percentage: number
  opportunity_score: number
  calculated_at: string
}

export interface KeywordAnalysis extends Keyword {
  metrics?: KeywordMetrics
  books?: Book[]
  book_count?: number
}
