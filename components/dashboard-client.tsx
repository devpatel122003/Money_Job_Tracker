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
        console.error("Error fetching dashboard data:", error)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
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
    monthlyIncome: summary?.monthlyIncome || 0,
    monthlyExpenses: summary?.monthlyExpenses || 0,
    balance: summary?.availableBalance ?? summary?.totalBalance ?? 0,
    savingsAllocation: summary?.totalSavingsAllocation || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your complete overview of job applications and finances
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-xl">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="hidden xs:inline">Total Applications</span>
                <span className="xs:hidden">Applications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{stats.activeApplications} active</p>
            </CardContent>
          </Card>

          <Card className="border-green-200/50 bg-gradient-to-br from-green-50/80 to-white/80 backdrop-blur-xl">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="hidden xs:inline">Monthly Income</span>
                <span className="xs:hidden">Income</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">${stats.monthlyIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-red-200/50 bg-gradient-to-br from-red-50/80 to-white/80 backdrop-blur-xl">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                <span className="hidden xs:inline">Monthly Expenses</span>
                <span className="xs:hidden">Expenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">${stats.monthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">This month</p>
            </CardContent>
          </Card>

          <Card
            className={`border-purple-200/50 bg-gradient-to-br ${stats.balance >= 0 ? "from-purple-50/80" : "from-amber-50/80"} to-white/80 backdrop-blur-xl`}
          >
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className={`text-2xl sm:text-3xl font-bold ${stats.balance >= 0 ? "text-purple-600" : "text-amber-600"}`}>
                ${stats.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                After savings and Planning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <Link href="/jobs" className="block">
            <Card className="hover:shadow-xl transition-all cursor-pointer h-full backdrop-blur-xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span>Job Applications</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Track and manage your job search journey</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/finance" className="block">
            <Card className="hover:shadow-xl transition-all cursor-pointer h-full backdrop-blur-xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <span>Finance Tracker</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Monitor your income and expenses</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <JobStatusChart applications={applications} />
          <ApplicationTimelineChart applications={applications} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <ExpenseCategoryChart expenses={expenses} />
          <IncomeVsExpensesChart income={income} expenses={expenses} />
        </div>
      </div>
    </div>
  )
}