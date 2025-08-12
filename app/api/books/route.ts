import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const keywordId = searchParams.get("keyword_id")
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  try {
    let query = supabase
      .from("books")
      .select(`
        *,
        keywords (name)
      `)
      .order("current_bsr", { ascending: true })
      .limit(limit)

    if (keywordId) {
      query = query.eq("keyword_id", keywordId)
    }

    const { data: books, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ books })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}
