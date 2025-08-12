"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

async function getTrendData() {
  // Mock trend data - in real app, fetch from API
  return [
    { month: "Jan", sales: 12000, bsr: 45000 },
    { month: "Feb", sales: 15000, bsr: 38000 },
    { month: "Mar", sales: 18000, bsr: 32000 },
    { month: "Apr", sales: 22000, bsr: 28000 },
    { month: "May", sales: 25000, bsr: 25000 },
    { month: "Jun", sales: 28000, bsr: 22000 },
    { month: "Jul", sales: 32000, bsr: 18000 },
    { month: "Aug", sales: 35000, bsr: 15000 },
    { month: "Sep", sales: 38000, bsr: 12000 },
    { month: "Oct", sales: 42000, bsr: 10000 },
    { month: "Nov", sales: 45000, bsr: 8500 },
    { month: "Dec", sales: 48000, bsr: 7200 },
  ]
}

export async function TrendChart() {
  const data = await getTrendData()

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">12-Month Market Trends</CardTitle>
        <p className="text-sm text-slate-600">Sales volume and BSR trends for selected niches</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis yAxisId="sales" orientation="left" stroke="#84cc16" fontSize={12} />
              <YAxis yAxisId="bsr" orientation="right" stroke="#0891b2" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Line
                yAxisId="sales"
                type="monotone"
                dataKey="sales"
                stroke="#84cc16"
                strokeWidth={3}
                dot={{ fill: "#84cc16", strokeWidth: 2, r: 4 }}
                name="Monthly Sales"
              />
              <Line
                yAxisId="bsr"
                type="monotone"
                dataKey="bsr"
                stroke="#0891b2"
                strokeWidth={3}
                dot={{ fill: "#0891b2", strokeWidth: 2, r: 4 }}
                name="Average BSR"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
