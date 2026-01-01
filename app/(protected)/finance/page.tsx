"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { IncomeForm } from "@/components/income-form"
import { ExpenseForm } from "@/components/expense-form"
import { BudgetForm } from "@/components/budget-form"
import { PlannedExpenseForm } from "@/components/planned-expense-form"
import { ExpenseCategoryChart } from "@/components/expense-category-chart"
import { IncomeVsExpensesChart } from "@/components/income-vs-expenses-chart"

type ViewType = "transactions" | "planned" | "budgets"

export default function FinancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentView, setCurrentView] = useState<ViewType | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [income, setIncome] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [allPlannedExpenses, setAllPlannedExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showPlannedExpenseForm, setShowPlannedExpenseForm] = useState(false)

  const fetchData = async () => {
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`

      const [summaryRes, incomeRes, expensesRes, budgetsRes, plannedRes] = await Promise.all([
        fetch(`/api/finance/summary?month=${monthStr}`),
        fetch(`/api/finance/income?month=${monthStr}`),
        fetch(`/api/finance/expenses?month=${monthStr}`),
        fetch(`/api/finance/budgets?month=${monthStr}`),
        fetch(`/api/finance/planned-expenses`),
      ])

      const summaryData = await summaryRes.json()
      const incomeData = await incomeRes.json()
      const expensesData = await expensesRes.json()
      const budgetsData = await budgetsRes.json()
      const plannedData = await plannedRes.json()

      setSummary(summaryData)
      setIncome(Array.isArray(incomeData) ? incomeData : [])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setBudgets(Array.isArray(budgetsData) ? budgetsData : [])
      setAllPlannedExpenses(Array.isArray(plannedData) ? plannedData : [])
    } catch (error) {
      console.error("Error fetching finance data:", error)
      setSummary(null)
      setIncome([])
      setExpenses([])
      setBudgets([])
      setAllPlannedExpenses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentMonth])

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
    const month = new Date(expense.planned_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
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
      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl">
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

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

              <Card className={`border-indigo-200 bg-gradient-to-br ${summary?.overallBalance >= 0 ? "from-indigo-50" : "from-red-50"} to-white`}>
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-indigo-600" />
                    <span>Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className={`text-2xl sm:text-3xl font-bold ${summary?.overallBalance >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                    ${summary?.overallBalance?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">After planned</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <ExpenseCategoryChart expenses={expenses} />
              <IncomeVsExpensesChart income={income} expenses={expenses} />
            </div>

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
                            {new Date(item.income_date).toLocaleDateString()} • {item.category}
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
                          <div className="font-medium truncate">{item.merchant || item.category}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(item.expense_date).toLocaleDateString()} • {item.category}
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
                                {new Date(item.planned_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })} • {item.category}
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
      </div>
    </div>
  )
}