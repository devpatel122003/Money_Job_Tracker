"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"

interface ExpenseCategoryChartProps {
  expenses: any[]
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f59e0b",
  transportation: "#3b82f6",
  housing: "#8b5cf6",
  education: "#10b981",
  entertainment: "#ec4899",
  utilities: "#06b6d4",
  healthcare: "#ef4444",
  shopping: "#a855f7",
  other: "#6b7280",
}

export function ExpenseCategoryChart({ expenses }: ExpenseCategoryChartProps) {
  // Group expenses by category
  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(categoryTotals)
    .map(([category, total]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      total: Number(total.toFixed(2)),
      color: CATEGORY_COLORS[category] || "#6b7280",
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Your spending breakdown across different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="category" type="category" width={100} />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Bar dataKey="total" name="Amount ($)">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
