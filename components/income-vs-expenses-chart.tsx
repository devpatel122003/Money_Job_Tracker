"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface IncomeVsExpensesChartProps {
  income: any[]
  expenses: any[]
}

export function IncomeVsExpensesChart({ income, expenses }: IncomeVsExpensesChartProps) {
  // Get last 6 months
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    months.push({ key: monthKey, label: monthLabel })
  }

  const data = months.map(({ key, label }) => {
    const monthIncome = income
      .filter((item) => {
        const itemDate = new Date(item.income_date)
        const itemKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`
        return itemKey === key
      })
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const monthExpenses = expenses
      .filter((item) => {
        const itemDate = new Date(item.expense_date)
        const itemKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`
        return itemKey === key
      })
      .reduce((sum, item) => sum + Number(item.amount), 0)

    return {
      month: label,
      income: Number(monthIncome.toFixed(2)),
      expenses: Number(monthExpenses.toFixed(2)),
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses Trend</CardTitle>
        <CardDescription>Compare your income and expenses over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
