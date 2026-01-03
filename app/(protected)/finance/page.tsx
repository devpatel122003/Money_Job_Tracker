"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trash2,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Receipt,
  CalendarDays,
  BarChart3,
  Home,
  CalendarRange,
  PieChart,
  PiggyBank,
} from "lucide-react"
import { IncomeForm } from "@/components/income-form"
import { ExpenseForm } from "@/components/expense-form"
import { BudgetForm } from "@/components/budget-form"
import { PlannedExpenseForm } from "@/components/planned-expense-form"
import { ExpenseCategoryChart } from "@/components/expense-category-chart"
import { IncomeVsExpensesChart } from "@/components/income-vs-expenses-chart"
import { SavingsAllocationForm } from "@/components/savings-allocation-form"
import { SavingsOverviewCard } from "@/components/savings-overview-card"
import { SavingsGoalsList } from "@/components/savings-goals-list"
import { capitalizeText } from "@/lib/utils"

type ViewType = "transactions" | "planned" | "budgets" | "savings"

// Mobile navigation interface
interface MobileNavItem {
  id: ViewType | "overview" | "savings"
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

export default function FinancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentView, setCurrentView] = useState<ViewType | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [income, setIncome] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [allPlannedExpenses, setAllPlannedExpenses] = useState<any[]>([])

  // Savings state variables
  const [savingsGoals, setSavingsGoals] = useState<any[]>([])
  const [savingsSummary, setSavingsSummary] = useState<any>(null)
  const [showSavingsForm, setShowSavingsForm] = useState(false)
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<any>(null)
  const [showSavingsSection, setShowSavingsSection] = useState(false)

  // Helper function to format date strings without timezone conversion
  // Takes "YYYY-MM-DD" or ISO date string and formats it for display
  const formatLocalDate = (dateValue: any, options?: Intl.DateTimeFormatOptions) => {
    if (!dateValue) return 'Invalid Date'

    let dateStr = dateValue

    // If it's a Date object, convert to YYYY-MM-DD
    if (dateValue instanceof Date) {
      dateStr = dateValue.toISOString().split('T')[0]
    }
    // If it's an ISO string with time, extract just the date part
    else if (typeof dateValue === 'string' && dateValue.includes('T')) {
      dateStr = dateValue.split('T')[0]
    }

    // Now we have YYYY-MM-DD, parse it as local date
    const [year, month, day] = String(dateStr).split('-').map(Number)

    if (!year || !month || !day) return 'Invalid Date'

    const localDate = new Date(year, month - 1, day)

    return localDate.toLocaleDateString('en-US', options || {})
  }
  const [loading, setLoading] = useState(true)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showPlannedExpenseForm, setShowPlannedExpenseForm] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<ViewType | "overview">("overview")
  const [isMobile, setIsMobile] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Mobile navigation items - only shown on mobile
  const mobileNavItems: MobileNavItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <Home className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <Receipt className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "planned",
      label: "Plan Ahead",
      icon: <CalendarRange className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: <PieChart className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "savings",
      label: "Savings",
      icon: <PiggyBank className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ]

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchData = async () => {
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`

      const [summaryRes, incomeRes, expensesRes, budgetsRes, plannedRes, savingsRes] = await Promise.all([
        fetch(`/api/finance/summary?month=${monthStr}`),
        fetch(`/api/finance/income?month=${monthStr}`),
        fetch(`/api/finance/expenses?month=${monthStr}`),
        fetch(`/api/finance/budgets?month=${monthStr}`),
        fetch(`/api/finance/planned-expenses`),
        fetch(`/api/finance/savings-goals`),
      ])

      const summaryData = await summaryRes.json()
      const incomeData = await incomeRes.json()
      const expensesData = await expensesRes.json()
      const budgetsData = await budgetsRes.json()
      const plannedData = await plannedRes.json()
      const savingsData = await savingsRes.json()

      setSummary(summaryData)
      setIncome(Array.isArray(incomeData) ? incomeData : [])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setBudgets(Array.isArray(budgetsData) ? budgetsData : [])
      setAllPlannedExpenses(Array.isArray(plannedData) ? plannedData : [])
      setSavingsGoals(savingsData.goals || [])
      setSavingsSummary(savingsData.summary || null)
    } catch (error) {
      console.error("Error fetching finance data:", error)
      setSummary(null)
      setIncome([])
      setExpenses([])
      setBudgets([])
      setAllPlannedExpenses([])
      setSavingsGoals([])
      setSavingsSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentMonth])

  // Sync active mobile tab with current view
  useEffect(() => {
    if (currentView === null) {
      setActiveMobileTab("overview")
    } else {
      setActiveMobileTab(currentView)
    }
  }, [currentView])

  // Handle mobile tab click
  const handleMobileTabClick = (tabId: ViewType | "overview") => {
    setActiveMobileTab(tabId)

    if (tabId === "overview") {
      setCurrentView(null)
    } else {
      setCurrentView(tabId)
    }

    // Scroll to top on mobile navigation
    if (isMobile && mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDeleteIncome = async (id: number) => {
    if (!confirm("Are you sure you want to delete this income entry?")) return

    try {
      await fetch(`/api/finance/income/${id}`, { method: "DELETE" })
      setIncome(income.filter((item) => item.id !== id))
      fetchData()
    } catch (error) {
      console.error("Error deleting income:", error)
    }
  }

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      await fetch(`/api/finance/expenses/${id}`, { method: "DELETE" })
      setExpenses(expenses.filter((item) => item.id !== id))
      fetchData()
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const handleDeleteBudget = async (id: number) => {
    if (!confirm("Are you sure you want to delete this budget?")) return

    try {
      await fetch(`/api/finance/budgets/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  const handleDeletePlannedExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this planned expense?")) return

    try {
      await fetch(`/api/finance/planned-expenses/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Error deleting planned expense:", error)
    }
  }

  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  const isCurrentMonth =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear()

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Calculate budget progress
  const budgetProgress = budgets.map((budget) => {
    const monthlyLimit = Number(budget.monthly_limit) || 0
    const categoryExpenses = expenses
      .filter((exp) => exp.category === budget.category)
      .reduce((sum, exp) => sum + Number(exp.amount), 0)
    const percentage = monthlyLimit > 0 ? (categoryExpenses / monthlyLimit) * 100 : 0
    return {
      ...budget,
      monthly_limit: monthlyLimit,
      spent: categoryExpenses,
      remaining: monthlyLimit - categoryExpenses,
      percentage: Math.min(percentage, 100),
      isOverBudget: categoryExpenses > monthlyLimit,
      isNearLimit: percentage >= 80 && percentage < 100,
    }
  })

  // Group planned expenses by month
  const plannedByMonth = allPlannedExpenses.reduce((acc: any, expense: any) => {
    const month = formatLocalDate(expense.planned_date, { month: "long", year: "numeric" })
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(expense)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading financial data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl" ref={mainContentRef}>
        {/* Header with Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            {/* Title and Month Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">Finance Dashboard</h1>
                <p className="text-sm text-muted-foreground">Track your income, expenses, and financial goals</p>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} className="h-9 w-9">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 min-w-[180px] justify-center px-3 py-2 bg-white rounded-lg border">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{formatMonth(currentMonth)}</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => changeMonth(1)} className="h-9 w-9">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isCurrentMonth && (
                  <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="hidden sm:flex">
                    Today
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Tab Navigation (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1">
              <Button
                variant={currentView === null ? "default" : "outline"}
                onClick={() => setCurrentView(null)}
                className={`flex-shrink-0 ${currentView === null
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={currentView === "transactions" ? "default" : "outline"}
                onClick={() => setCurrentView("transactions")}
                className={`flex-shrink-0 ${currentView === "transactions"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                  : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  }`}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Transactions
              </Button>
              <Button
                variant={currentView === "planned" ? "default" : "outline"}
                onClick={() => setCurrentView("planned")}
                className={`flex-shrink-0 ${currentView === "planned"
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                  : "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                  }`}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Plan Ahead
              </Button>
              <Button
                variant={currentView === "budgets" ? "default" : "outline"}
                onClick={() => setCurrentView("budgets")}
                className={`flex-shrink-0 ${currentView === "budgets"
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                  : "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                  }`}
              >
                <Target className="h-4 w-4 mr-2" />
                Budgets
              </Button>
              <Button
                variant={currentView === "savings" ? "default" : "outline"}
                onClick={() => setCurrentView("savings")}
                className={`flex-shrink-0 ${currentView === "savings"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  }`}
              >
                <PiggyBank className="h-4 w-4 mr-2" />
                Savings
              </Button>
            </div>
          </div>
        </div>

        {/* Overview (Default) */}
        {currentView === null && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Monthly Income</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    ${summary?.monthlyIncome?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{income.length} entries</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span>Monthly Expenses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">
                    ${summary?.monthlyExpenses?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{expenses.length} entries</p>
                </CardContent>
              </Card>

              <Card className={`border-blue-200 bg-gradient-to-br ${summary?.monthlyBalance >= 0 ? "from-blue-50" : "from-amber-50"} to-white`}>
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span>Monthly Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className={`text-2xl sm:text-3xl font-bold ${summary?.monthlyBalance >= 0 ? "text-blue-600" : "text-amber-600"}`}>
                    ${summary?.monthlyBalance?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className={`border-indigo-200 bg-gradient-to-br ${(summary?.availableBalance ?? summary?.totalBalance ?? 0) >= 0 ? "from-indigo-50" : "from-red-50"
                } to-white`}>
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-indigo-600" />
                    <span>Available Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className={`text-2xl sm:text-3xl font-bold ${(summary?.availableBalance ?? summary?.totalBalance ?? 0) >= 0 ? "text-indigo-600" : "text-red-600"
                    }`}>
                    ${(summary?.availableBalance ?? summary?.totalBalance ?? 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    After savings and Planning
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <ExpenseCategoryChart expenses={expenses} />
              <IncomeVsExpensesChart income={income} expenses={expenses} />
            </div>

            {/* Savings Overview */}
            {savingsSummary && savingsSummary.active_goals > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Savings Summary</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView("savings")}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <SavingsOverviewCard
                  summary={savingsSummary}
                  totalBalance={summary?.totalBalance || 0}
                  availableBalance={summary?.availableBalance || 0}
                  goals={savingsGoals}
                />
              </div>
            )}

            {/* Budget Overview */}
            {budgetProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Budget Overview</span>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentView("budgets")}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budgetProgress.slice(0, 5).map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{budget.category}</span>
                          {budget.isOverBudget && (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Over
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          ${budget.spent.toFixed(2)} / ${budget.monthly_limit.toFixed(2)}
                        </span>
                      </div>
                      <Progress
                        value={budget.percentage}
                        className={budget.isOverBudget ? "bg-red-100" : budget.isNearLimit ? "bg-amber-100" : ""}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Transactions View */}
        {currentView === "transactions" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Income */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Income</CardTitle>
                <Button onClick={() => setShowIncomeForm(true)} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                {income.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No income recorded</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {income.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.source}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatLocalDate(item.income_date)} • {capitalizeText(item.category)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold text-green-600">
                            ${Number(item.amount).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteIncome(item.id)}
                            className="h-8 w-8 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Expenses</CardTitle>
                <Button onClick={() => setShowExpenseForm(true)} size="sm" className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No expenses recorded</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {expenses.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.merchant || capitalizeText(item.category)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatLocalDate(item.expense_date)} • {capitalizeText(item.category)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold text-red-600">
                            ${Number(item.amount).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExpense(item.id)}
                            className="h-8 w-8 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Savings Allocation Display */}
                {savingsSummary && savingsSummary.total_monthly_allocation > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          <PiggyBank className="h-4 w-4 text-blue-600" />
                          Savings Allocation
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {savingsSummary.active_goals} active goal{savingsSummary.active_goals !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-blue-600">
                        ${savingsSummary.total_monthly_allocation.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plan Ahead View */}
        {currentView === "planned" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">All Planned Expenses</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Future expenses that will auto-convert when their date arrives
                </p>
              </div>
              <Button onClick={() => setShowPlannedExpenseForm(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Planned
              </Button>
            </CardHeader>
            <CardContent>
              {allPlannedExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No planned expenses yet</p>
                  <Button onClick={() => setShowPlannedExpenseForm(true)}>Add Your First Planned Expense</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(plannedByMonth).map(([month, expenses]: [string, any]) => (
                    <div key={month} className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{month}</h3>
                      <div className="space-y-2">
                        {expenses.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{item.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatLocalDate(item.planned_date, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })} • {capitalizeText(item.category)}
                              </div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-semibold text-orange-600">
                                ${Number(item.amount).toFixed(2)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePlannedExpense(item.id)}
                                className="h-8 w-8 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Planned:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${allPlannedExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This amount is already deducted from your balance
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Budgets View */}
        {currentView === "budgets" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Monthly Budgets</h2>
              <Button onClick={() => setShowBudgetForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </div>

            {budgetProgress.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No budgets set for this month</p>
                  <Button onClick={() => setShowBudgetForm(true)}>Create Your First Budget</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetProgress.map((budget) => (
                  <Card
                    key={budget.id}
                    className={
                      budget.isOverBudget
                        ? "border-red-300 bg-red-50/50"
                        : budget.isNearLimit
                          ? "border-amber-300 bg-amber-50/50"
                          : ""
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">{budget.category}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className={`font-semibold ${budget.isOverBudget ? "text-red-600" : ""}`}>
                          ${budget.spent.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-semibold">${budget.monthly_limit.toFixed(2)}</span>
                      </div>
                      <Progress
                        value={budget.percentage}
                        className={
                          budget.isOverBudget
                            ? "bg-red-100 [&>div]:bg-red-600"
                            : budget.isNearLimit
                              ? "bg-amber-100 [&>div]:bg-amber-600"
                              : ""
                        }
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className={`font-semibold ${budget.remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${Math.abs(budget.remaining).toFixed(2)} {budget.remaining < 0 ? "over" : "left"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Savings View */}
        {currentView === "savings" && (
          <div className="space-y-6">
            {/* Savings Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                  Savings Goals
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Allocate money toward your financial goals
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingSavingsGoal(null)
                  setShowSavingsForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Savings Goal
              </Button>
            </div>

            {/* Savings Stats Cards - Compact Grid */}
            {savingsSummary && (
              <SavingsOverviewCard
                summary={savingsSummary}
                totalBalance={summary?.totalBalance || 0}
                availableBalance={summary?.availableBalance || 0}
                goals={savingsGoals}
              />
            )}

            {/* Savings Goals List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Goals</h3>
              <SavingsGoalsList
                goals={savingsGoals}
                onEdit={(goal) => {
                  setEditingSavingsGoal(goal)
                  setShowSavingsForm(true)
                }}
                onRefresh={fetchData}
              />
            </div>

            {/* Empty State */}
            {savingsGoals.length === 0 && (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center">
                  <PiggyBank className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Savings Goals Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start building your financial future by creating your first savings goal.
                    Choose between monthly recurring allocations or one-time targets.
                  </p>
                  <Button
                    onClick={() => {
                      setEditingSavingsGoal(null)
                      setShowSavingsForm(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Forms */}
        <IncomeForm
          open={showIncomeForm}
          onOpenChange={setShowIncomeForm}
          onSuccess={() => {
            fetchData()
            setShowIncomeForm(false)
          }}
        />
        <ExpenseForm
          open={showExpenseForm}
          onOpenChange={setShowExpenseForm}
          onSuccess={() => {
            fetchData()
            setShowExpenseForm(false)
          }}
        />
        <BudgetForm
          open={showBudgetForm}
          onOpenChange={setShowBudgetForm}
          onSuccess={() => {
            fetchData()
            setShowBudgetForm(false)
          }}
          currentMonth={currentMonth}
        />
        <PlannedExpenseForm
          open={showPlannedExpenseForm}
          onOpenChange={setShowPlannedExpenseForm}
          onSuccess={() => {
            fetchData()
            setShowPlannedExpenseForm(false)
          }}
        />
        <SavingsAllocationForm
          open={showSavingsForm}
          onOpenChange={(open) => {
            setShowSavingsForm(open)
            if (!open) setEditingSavingsGoal(null)
          }}
          onSuccess={fetchData}
          monthlyIncome={summary?.monthlyIncome || 0}
          editData={editingSavingsGoal}
        />
      </div>

      {/* Mobile Bottom Navigation Bar (Conditionally rendered only on mobile) */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t z-40 shadow-lg">
          <div className="container mx-auto px-2">
            <div className="flex items-center justify-between py-2">
              {mobileNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMobileTabClick(item.id)}
                  className="flex flex-col items-center justify-center flex-1 relative group pt-1 pb-1"
                >
                  {/* Active Indicator */}
                  {activeMobileTab === item.id && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 h-1 w-8 rounded-full bg-current opacity-80"></div>
                  )}

                  {/* Icon Container */}
                  <div className={`
                    p-2 rounded-full mb-1 transition-all duration-200
                    ${activeMobileTab === item.id
                      ? `${item.bgColor} scale-110 shadow-md`
                      : 'bg-gray-100 group-hover:scale-105'
                    }
                  `}>
                    <div className={activeMobileTab === item.id ? item.color : 'text-gray-500'}>
                      {item.icon}
                    </div>
                  </div>

                  {/* Label */}
                  <span className={`
                    text-[10px] font-medium transition-all duration-200 text-center
                    ${activeMobileTab === item.id ? item.color : 'text-gray-500'}
                    ${activeMobileTab === item.id ? 'font-bold' : ''}
                  `}>
                    {item.label}
                  </span>

                  {/* Notification Badge for important updates */}
                  {item.id === 'transactions' && expenses.length > 0 && activeMobileTab !== 'transactions' && (
                    <span className="absolute top-0 right-1/3 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                  {item.id === 'planned' && allPlannedExpenses.length > 0 && activeMobileTab !== 'planned' && (
                    <span className="absolute top-0 right-1/3 h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                  )}
                  {item.id === 'budgets' && budgetProgress.some(b => b.isOverBudget) && activeMobileTab !== 'budgets' && (
                    <span className="absolute top-0 right-1/3 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add bottom padding for mobile navigation bar (Only when mobile nav is shown) */}
      {isMobile && <div className="pb-16"></div>}
    </div>
  )
}