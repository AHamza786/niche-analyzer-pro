import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "20")

  try {
    const { data: updateHistory, error } = await supabase
      .from("update_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ history: updateHistory })
  } catch (error) {
    console.error("Update history error:", error)
    return NextResponse.json({ error: "Failed to fetch update history" }, { status: 500 })
  }
}
