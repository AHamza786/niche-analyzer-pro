import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { updateId: string } }) {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { data: updateStatus, error } = await supabase
      .from("update_jobs")
      .select("*")
      .eq("id", params.updateId)
      .single()

    if (error || !updateStatus) {
      return NextResponse.json({ error: "Update job not found" }, { status: 404 })
    }

    return NextResponse.json({ status: updateStatus })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ error: "Failed to check update status" }, { status: 500 })
  }
}
