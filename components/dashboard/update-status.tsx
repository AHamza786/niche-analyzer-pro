"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Clock, CheckCircle, XCircle, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export function UpdateStatus() {
  const [updateHistory, setUpdateHistory] = useState<UpdateJob[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUpdateHistory()
    const interval = setInterval(fetchUpdateHistory, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchUpdateHistory = async () => {
    try {
      const response = await fetch("/api/updates/history?limit=10")
      if (response.ok) {
        const data = await response.json()
        setUpdateHistory(data.history || [])
      }
    } catch (error) {
      console.error("Failed to fetch update history:", error)
    }
  }

  const triggerUpdate = async (type: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/updates/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Update Started",
          description: data.message,
        })
        fetchUpdateHistory()
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to start update. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatUpdateType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Data Updates</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => triggerUpdate("bsr_history")} disabled={isLoading}>
              <Play className="h-3 w-3 mr-1" />
              BSR Update
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerUpdate("metrics_recalculation")}
              disabled={isLoading}
            >
              <Play className="h-3 w-3 mr-1" />
              Recalc Metrics
            </Button>
            <Button
              size="sm"
              onClick={() => triggerUpdate("all_keywords")}
              disabled={isLoading}
              className="bg-cyan-800 hover:bg-cyan-700"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Full Update
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updateHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No update history available</p>
            </div>
          ) : (
            updateHistory.map((job) => (
              <div key={job.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className="font-medium text-slate-900">{formatUpdateType(job.type)}</span>
                  </div>
                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                </div>

                {job.status === "running" && (
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>
                        {job.processed_items} / {job.total_items}
                      </span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                )}

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Started: {new Date(job.created_at).toLocaleString()}</span>
                  {job.completed_at && <span>Completed: {new Date(job.completed_at).toLocaleString()}</span>}
                </div>

                {job.error_message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {job.error_message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
