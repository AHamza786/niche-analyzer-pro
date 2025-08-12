import { createServerClient } from "@/lib/supabase/server"
import { mockAmazonBookFetch } from "./amazon-mock"
import { calculateBSRToSales, calculateOpportunityScore } from "@/lib/utils/calculations"

export async function analyzeKeyword(keywordName: string, keywordId: string) {
  const supabase = createServerClient()

  if (!supabase) {
    throw new Error("Database not configured")
  }

  try {
    // Fetch books from "Amazon" (mock data)
    const amazonBooks = await mockAmazonBookFetch(keywordName)

    // Store books in database
    const booksToInsert = amazonBooks.map((book) => ({
      keyword_id: keywordId,
      asin: book.asin,
      title: book.title,
      publisher: book.publisher,
      price: book.price,
      current_bsr: book.bsr,
      review_count: book.reviewCount,
      publication_date: book.publicationDate,
    }))

    // Insert books (ignore conflicts for existing ASINs)
    const { data: insertedBooks, error: booksError } = await supabase
      .from("books")
      .upsert(booksToInsert, { onConflict: "asin" })
      .select()

    if (booksError) {
      console.error("Error inserting books:", booksError)
    }

    // Calculate metrics
    const totalBooks = amazonBooks.length
    const selfPubBooks = amazonBooks.filter(
      (book) =>
        book.publisher === "Independent" ||
        book.publisher === "Self-Published" ||
        book.publisher?.includes("Independent"),
    ).length

    const totalSales = amazonBooks.reduce((sum, book) => sum + calculateBSRToSales(book.bsr), 0)

    const selfPubSales = amazonBooks
      .filter(
        (book) =>
          book.publisher === "Independent" ||
          book.publisher === "Self-Published" ||
          book.publisher?.includes("Independent"),
      )
      .reduce((sum, book) => sum + calculateBSRToSales(book.bsr), 0)

    const avgPrice = amazonBooks.reduce((sum, book) => sum + book.price, 0) / totalBooks
    const royalties = selfPubSales * avgPrice * 0.35 // Assuming 35% royalty rate

    const recentBooks = amazonBooks.filter((book) => {
      const pubDate = new Date(book.publicationDate)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return pubDate >= thirtyDaysAgo
    }).length

    const successRate = (amazonBooks.filter((book) => book.bsr < 100000).length / totalBooks) * 100
    const selfPubPercentage = (selfPubBooks / totalBooks) * 100

    const opportunityScore = calculateOpportunityScore({
      totalSales,
      selfPubPercentage,
      successRate,
      newPublications: recentBooks,
      avgBSR: amazonBooks.reduce((sum, book) => sum + book.bsr, 0) / totalBooks,
    })

    // Store metrics
    const metrics = {
      keyword_id: keywordId,
      total_sales: Math.round(totalSales),
      self_pub_sales: Math.round(selfPubSales),
      demand_trend: totalSales > 10000 ? "rising" : totalSales > 5000 ? "stable" : "declining",
      royalties: Math.round(royalties * 100) / 100,
      new_publications_30d: recentBooks,
      supply_trend: recentBooks > 20 ? "rising" : recentBooks > 10 ? "stable" : "declining",
      success_rate: Math.round(successRate * 100) / 100,
      self_pub_percentage: Math.round(selfPubPercentage * 100) / 100,
      opportunity_score: Math.round(opportunityScore * 100) / 100,
    }

    const { data: savedMetrics, error: metricsError } = await supabase
      .from("keyword_metrics")
      .upsert(metrics, { onConflict: "keyword_id" })
      .select()
      .single()

    if (metricsError) {
      console.error("Error saving metrics:", metricsError)
    }

    return {
      keyword: keywordName,
      books: amazonBooks,
      metrics: savedMetrics || metrics,
      analysis: {
        totalBooks,
        selfPubBooks,
        avgPrice: Math.round(avgPrice * 100) / 100,
        topPerformers: amazonBooks.filter((book) => book.bsr < 50000).length,
      },
    }
  } catch (error) {
    console.error("Keyword analysis error:", error)
    throw error
  }
}
