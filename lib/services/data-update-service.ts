import { createServerClient } from "@/lib/supabase/server"
import { analyzeKeyword } from "./keyword-analyzer"

interface UpdateResult {
  updateId: string
  message: string
  estimatedDuration: string
}

interface UpdateJob {
  id: string
  type: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  total_items: number
  processed_items: number
  error_message?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export class DataUpdateService {
  private supabase = createServerClient()

  async updateAllKeywords(): Promise<UpdateResult> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    // Get all keywords
    const { data: keywords, error } = await this.supabase.from("keywords").select("*")

    if (error) {
      throw new Error(`Failed to fetch keywords: ${error.message}`)
    }

    const updateId = await this.createUpdateJob("all_keywords", keywords?.length || 0)

    // Process in background (in a real app, this would be a queue job)
    this.processKeywordUpdates(updateId, keywords || [])

    return {
      updateId,
      message: `Started update for ${keywords?.length || 0} keywords`,
      estimatedDuration: `${Math.ceil((keywords?.length || 0) * 2)} minutes`,
    }
  }

  async updateSpecificKeywords(keywordIds: string[]): Promise<UpdateResult> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    const { data: keywords, error } = await this.supabase.from("keywords").select("*").in("id", keywordIds)

    if (error) {
      throw new Error(`Failed to fetch keywords: ${error.message}`)
    }

    const updateId = await this.createUpdateJob("specific_keywords", keywords?.length || 0)

    this.processKeywordUpdates(updateId, keywords || [])

    return {
      updateId,
      message: `Started update for ${keywords?.length || 0} specific keywords`,
      estimatedDuration: `${Math.ceil((keywords?.length || 0) * 2)} minutes`,
    }
  }

  async updateBSRHistory(): Promise<UpdateResult> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    // Get all books that need BSR history updates
    const { data: books, error } = await this.supabase.from("books").select("*").not("current_bsr", "is", null)

    if (error) {
      throw new Error(`Failed to fetch books: ${error.message}`)
    }

    const updateId = await this.createUpdateJob("bsr_history", books?.length || 0)

    this.processBSRHistoryUpdates(updateId, books || [])

    return {
      updateId,
      message: `Started BSR history update for ${books?.length || 0} books`,
      estimatedDuration: `${Math.ceil((books?.length || 0) * 0.5)} minutes`,
    }
  }

  async recalculateAllMetrics(): Promise<UpdateResult> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    const { data: keywords, error } = await this.supabase.from("keywords").select("*")

    if (error) {
      throw new Error(`Failed to fetch keywords: ${error.message}`)
    }

    const updateId = await this.createUpdateJob("metrics_recalculation", keywords?.length || 0)

    this.processMetricsRecalculation(updateId, keywords || [])

    return {
      updateId,
      message: `Started metrics recalculation for ${keywords?.length || 0} keywords`,
      estimatedDuration: `${Math.ceil((keywords?.length || 0) * 1)} minutes`,
    }
  }

  private async createUpdateJob(type: string, totalItems: number): Promise<string> {
    if (!this.supabase) {
      throw new Error("Database not configured")
    }

    const { data: job, error } = await this.supabase
      .from("update_jobs")
      .insert({
        type,
        status: "pending",
        progress: 0,
        total_items: totalItems,
        processed_items: 0,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create update job: ${error.message}`)
    }

    return job.id
  }

  private async updateJobStatus(
    updateId: string,
    status: UpdateJob["status"],
    progress?: number,
    processedItems?: number,
    errorMessage?: string,
  ) {
    if (!this.supabase) return

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (progress !== undefined) updateData.progress = progress
    if (processedItems !== undefined) updateData.processed_items = processedItems
    if (errorMessage) updateData.error_message = errorMessage
    if (status === "completed") updateData.completed_at = new Date().toISOString()

    await this.supabase.from("update_jobs").update(updateData).eq("id", updateId)
  }

  private async processKeywordUpdates(updateId: string, keywords: any[]) {
    try {
      await this.updateJobStatus(updateId, "running", 0, 0)

      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i]

        try {
          // Analyze keyword (this will fetch new book data and update metrics)
          await analyzeKeyword(keyword.name, keyword.id)

          const progress = Math.round(((i + 1) / keywords.length) * 100)
          await this.updateJobStatus(updateId, "running", progress, i + 1)

          // Add small delay to avoid overwhelming the system
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to update keyword ${keyword.name}:`, error)
          // Continue with other keywords even if one fails
        }
      }

      await this.updateJobStatus(updateId, "completed", 100, keywords.length)
    } catch (error) {
      console.error("Keyword update process failed:", error)
      await this.updateJobStatus(
        updateId,
        "failed",
        undefined,
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      )
    }
  }

  private async processBSRHistoryUpdates(updateId: string, books: any[]) {
    try {
      await this.updateJobStatus(updateId, "running", 0, 0)

      for (let i = 0; i < books.length; i++) {
        const book = books[i]

        try {
          // Simulate fetching current BSR (in real app, this would call Amazon API)
          const currentBSR = book.current_bsr + Math.floor(Math.random() * 10000 - 5000) // Simulate BSR change

          // Update current BSR
          await this.supabase?.from("books").update({ current_bsr: currentBSR }).eq("id", book.id)

          // Add BSR history entry
          await this.supabase?.from("bsr_history").insert({
            book_id: book.id,
            bsr: currentBSR,
            date: new Date().toISOString().split("T")[0],
            daily_sales: this.calculateDailySales(currentBSR),
          })

          const progress = Math.round(((i + 1) / books.length) * 100)
          await this.updateJobStatus(updateId, "running", progress, i + 1)

          // Small delay
          await new Promise((resolve) => setTimeout(resolve, 200))
        } catch (error) {
          console.error(`Failed to update BSR history for book ${book.id}:`, error)
        }
      }

      await this.updateJobStatus(updateId, "completed", 100, books.length)
    } catch (error) {
      console.error("BSR history update process failed:", error)
      await this.updateJobStatus(
        updateId,
        "failed",
        undefined,
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      )
    }
  }

  private async processMetricsRecalculation(updateId: string, keywords: any[]) {
    try {
      await this.updateJobStatus(updateId, "running", 0, 0)

      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i]

        try {
          // Get books for this keyword
          const { data: books } = (await this.supabase?.from("books").select("*").eq("keyword_id", keyword.id)) || {
            data: [],
          }

          if (books && books.length > 0) {
            // Recalculate metrics based on current book data
            const totalSales = books.reduce(
              (sum, book) => sum + this.calculateDailySales(book.current_bsr || 1000000),
              0,
            )
            const selfPubBooks = books.filter(
              (book) =>
                book.publisher?.includes("Independent") ||
                book.publisher?.includes("Self") ||
                book.publisher === "CreateSpace Independent",
            )
            const selfPubSales = selfPubBooks.reduce(
              (sum, book) => sum + this.calculateDailySales(book.current_bsr || 1000000),
              0,
            )

            const avgPrice = books.reduce((sum, book) => sum + (book.price || 0), 0) / books.length
            const royalties = selfPubSales * avgPrice * 0.35

            const successRate =
              (books.filter((book) => (book.current_bsr || 1000000) < 100000).length / books.length) * 100
            const selfPubPercentage = (selfPubBooks.length / books.length) * 100

            // Calculate opportunity score
            const opportunityScore = this.calculateOpportunityScore({
              totalSales,
              selfPubPercentage,
              successRate,
              avgBSR: books.reduce((sum, book) => sum + (book.current_bsr || 1000000), 0) / books.length,
            })

            // Update metrics
            await this.supabase?.from("keyword_metrics").upsert(
              {
                keyword_id: keyword.id,
                total_sales: Math.round(totalSales),
                self_pub_sales: Math.round(selfPubSales),
                demand_trend: totalSales > 10000 ? "rising" : totalSales > 5000 ? "stable" : "declining",
                royalties: Math.round(royalties * 100) / 100,
                new_publications_30d: Math.floor(Math.random() * 50), // Mock data
                supply_trend: "stable",
                success_rate: Math.round(successRate * 100) / 100,
                self_pub_percentage: Math.round(selfPubPercentage * 100) / 100,
                opportunity_score: Math.round(opportunityScore * 100) / 100,
              },
              { onConflict: "keyword_id" },
            )
          }

          const progress = Math.round(((i + 1) / keywords.length) * 100)
          await this.updateJobStatus(updateId, "running", progress, i + 1)

          await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Failed to recalculate metrics for keyword ${keyword.name}:`, error)
        }
      }

      await this.updateJobStatus(updateId, "completed", 100, keywords.length)
    } catch (error) {
      console.error("Metrics recalculation process failed:", error)
      await this.updateJobStatus(
        updateId,
        "failed",
        undefined,
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      )
    }
  }

  private calculateDailySales(bsr: number): number {
    if (bsr <= 100) return 300 + (100 - bsr) * 5
    if (bsr <= 1000) return 50 + (1000 - bsr) * 0.25
    if (bsr <= 10000) return 10 + (10000 - bsr) * 0.004
    if (bsr <= 100000) return 2 + (100000 - bsr) * 0.00008
    if (bsr <= 500000) return 1 + (500000 - bsr) * 0.000002
    return Math.max(0.1, 1 - (bsr - 500000) * 0.000001)
  }

  private calculateOpportunityScore(factors: {
    totalSales: number
    selfPubPercentage: number
    successRate: number
    avgBSR: number
  }): number {
    const { totalSales, selfPubPercentage, successRate, avgBSR } = factors

    let demandScore = 0
    if (totalSales > 50000) demandScore = 30
    else if (totalSales > 20000) demandScore = 25
    else if (totalSales > 10000) demandScore = 20
    else if (totalSales > 5000) demandScore = 15
    else if (totalSales > 1000) demandScore = 10
    else demandScore = 5

    let competitionScore = 0
    if (avgBSR > 500000) competitionScore = 25
    else if (avgBSR > 200000) competitionScore = 20
    else if (avgBSR > 100000) competitionScore = 15
    else if (avgBSR > 50000) competitionScore = 10
    else competitionScore = 5

    let selfPubScore = 0
    if (selfPubPercentage > 80) selfPubScore = 20
    else if (selfPubPercentage > 60) selfPubScore = 16
    else if (selfPubPercentage > 40) selfPubScore = 12
    else if (selfPubPercentage > 20) selfPubScore = 8
    else selfPubScore = 4

    let successScore = 0
    if (successRate > 80) successScore = 15
    else if (successRate > 60) successScore = 12
    else if (successRate > 40) successScore = 9
    else if (successRate > 20) successScore = 6
    else successScore = 3

    const totalScore = demandScore + competitionScore + selfPubScore + successScore

    return Math.min(100, Math.max(0, totalScore))
  }
}

export const dataUpdateService = new DataUpdateService()
