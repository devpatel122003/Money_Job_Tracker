"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ApplicationTimelineChartProps {
  applications: any[]
}

export function ApplicationTimelineChart({ applications }: ApplicationTimelineChartProps) {
  // Group applications by month
  const monthlyData = applications.reduce(
    (acc, app) => {
      const date = new Date(app.application_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = date.toLocaleDateString("en-US", { year: "numeric", month: "short" })

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthLabel, count: 0 }
      }
      acc[monthKey].count++
      return acc
    },
    {} as Record<string, { month: string; count: number }>,
  )

  const data = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Timeline</CardTitle>
        <CardDescription>Number of applications submitted over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Applications" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
