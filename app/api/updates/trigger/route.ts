import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { dataUpdateService } from "@/lib/services/data-update-service"

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { type, keywordIds } = await request.json()

    let result
    switch (type) {
      case "all_keywords":
        result = await dataUpdateService.updateAllKeywords()
        break
      case "specific_keywords":
        if (!keywordIds || !Array.isArray(keywordIds)) {
          return NextResponse.json({ error: "keywordIds array required for specific updates" }, { status: 400 })
        }
        result = await dataUpdateService.updateSpecificKeywords(keywordIds)
        break
      case "bsr_history":
        result = await dataUpdateService.updateBSRHistory()
        break
      case "metrics_recalculation":
        result = await dataUpdateService.recalculateAllMetrics()
        break
      default:
        return NextResponse.json({ error: "Invalid update type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      updateId: result.updateId,
      message: result.message,
      estimatedDuration: result.estimatedDuration,
    })
  } catch (error) {
    console.error("Update trigger error:", error)
    return NextResponse.json({ error: "Failed to trigger update" }, { status: 500 })
  }
}
