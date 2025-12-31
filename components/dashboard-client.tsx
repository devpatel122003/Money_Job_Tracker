"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, DollarSign, RefreshCw, TrendingUp, ArrowRight } from "lucide-react"
import { JobStatusChart } from "@/components/job-status-chart"
import { ApplicationTimelineChart } from "@/components/application-timeline-chart"
import { ExpenseCategoryChart } from "@/components/expense-category-chart"
import { IncomeVsExpensesChart } from "@/components/income-vs-expenses-chart"

interface DashboardClientProps {
  user: {
    id: number
    email: string
    name: string
  }
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [applications, setApplications] = useState<any[]>([])
  const [income, setIncome] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, incomeRes, expensesRes, summaryRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/finance/income"),
          fetch("/api/finance/expenses"),
          fetch("/api/finance/summary"),
        ])

        const [appsData, incomeData, expensesData, summaryData] = await Promise.all([
          appsRes.json(),
          incomeRes.json(),
          expensesRes.json(),
          summaryRes.json(),
        ])

        setApplications(Array.isArray(appsData) ? appsData : [])
        setIncome(Array.isArray(incomeData) ? incomeData : [])
        setExpenses(Array.isArray(expensesData) ? expensesData : [])
        setSummary(summaryData?.error ? null : summaryData)
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
        setApplications([])
        setIncome([])
        setExpenses([])
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = {
    totalApplications: applications.length,
    activeApplications: applications.filter(
      (a) =>
        a.application_status === "applied" ||
        a.application_status === "phone_screen" ||
        a.application_status === "interview",
    ).length,
    monthlyIncome: summary?.totalIncome || 0,
    monthlyExpenses: summary?.totalExpenses || 0,
    balance: summary?.balance || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground text-balance">Your complete overview of job applications and finances</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activeApplications} active</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${stats.monthlyIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                Monthly Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">${stats.monthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card
            className={`border-purple-200 bg-gradient-to-br ${stats.balance >= 0 ? "from-purple-50" : "from-amber-50"} to-white`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-purple-600" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.balance >= 0 ? "text-purple-600" : "text-amber-600"}`}>
                ${stats.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Net this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Link href="/jobs" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Job Applications
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Track and manage your job search journey</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/finance" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Finance Tracker
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Monitor your income and expenses</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <JobStatusChart applications={applications} />
          <ApplicationTimelineChart applications={applications} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseCategoryChart expenses={expenses} />
          <IncomeVsExpensesChart income={income} expenses={expenses} />
        </div>
      </div>
    </div>
  )
}
