import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { analyzeKeyword } from "@/lib/services/keyword-analyzer"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const keywordId = params.id

    // Verify keyword exists
    const { data: keyword, error: keywordError } = await supabase
      .from("keywords")
      .select("*")
      .eq("id", keywordId)
      .single()

    if (keywordError || !keyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 })
    }

    // Analyze the keyword
    const analysis = await analyzeKeyword(keyword.name, keywordId)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze keyword" }, { status: 500 })
  }
}
