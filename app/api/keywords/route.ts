import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { data: keywords, error } = await supabase
      .from("keywords")
      .select(`
        *,
        keyword_metrics (
          total_sales,
          self_pub_sales,
          demand_trend,
          royalties,
          new_publications_30d,
          supply_trend,
          success_rate,
          self_pub_percentage,
          opportunity_score,
          calculated_at
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ keywords })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { name } = await request.json()

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Keyword name is required" }, { status: 400 })
    }

    // Insert keyword
    const { data: keyword, error: keywordError } = await supabase
      .from("keywords")
      .insert({ name: name.toLowerCase().trim() })
      .select()
      .single()

    if (keywordError) {
      if (keywordError.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Keyword already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: keywordError.message }, { status: 500 })
    }

    return NextResponse.json({ keyword }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create keyword" }, { status: 500 })
  }
}
