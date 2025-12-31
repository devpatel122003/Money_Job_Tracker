"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CheckCircle2,
} from "lucide-react"
import { IncomeForm } from "@/components/income-form"
import { ExpenseForm } from "@/components/expense-form"
import { BudgetForm } from "@/components/budget-form"
import { SavingsGoalForm } from "@/components/savings-goal-form"
import { ExpenseCategoryChart } from "@/components/expense-category-chart"
import { IncomeVsExpensesChart } from "@/components/income-vs-expenses-chart"

export default function FinancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [summary, setSummary] = useState<any>(null)
  const [income, setIncome] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [savingsGoals, setSavingsGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showSavingsGoalForm, setShowSavingsGoalForm] = useState(false)

  const fetchData = async () => {
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`

      const [summaryRes, incomeRes, expensesRes, budgetsRes, savingsRes] = await Promise.all([
        fetch(`/api/finance/summary?month=${monthStr}`),
        fetch(`/api/finance/income?month=${monthStr}`),
        fetch(`/api/finance/expenses?month=${monthStr}`),
        fetch(`/api/finance/budgets?month=${monthStr}`),
        fetch(`/api/finance/savings-goals`),
      ])

      const summaryData = await summaryRes.json()
      const incomeData = await incomeRes.json()
      const expensesData = await expensesRes.json()
      const budgetsData = await budgetsRes.json()
      const savingsData = await savingsRes.json()

      setSummary(summaryData)
      setIncome(Array.isArray(incomeData) ? incomeData : [])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setBudgets(Array.isArray(budgetsData) ? budgetsData : [])
      setSavingsGoals(Array.isArray(savingsData) ? savingsData : [])
    } catch (error) {
      console.error("[v0] Error fetching finance data:", error)
      setSummary(null)
      setIncome([])
      setExpenses([])
      setBudgets([])
      setSavingsGoals([])
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
      console.error("[v0] Error deleting income:", error)
    }
  }

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      await fetch(`/api/finance/expenses/${id}`, { method: "DELETE" })
      setExpenses(expenses.filter((item) => item.id !== id))
      fetchData()
    } catch (error) {
      console.error("[v0] Error deleting expense:", error)
    }
  }

  const handleDeleteBudget = async (id: number) => {
    if (!confirm("Are you sure you want to delete this budget?")) return

    try {
      await fetch(`/api/finance/budgets/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("[v0] Error deleting budget:", error)
    }
  }

  const handleDeleteSavingsGoal = async (id: number) => {
    if (!confirm("Are you sure you want to delete this savings goal?")) return

    try {
      await fetch(`/api/finance/savings-goals/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("[v0] Error deleting savings goal:", error)
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

  // Calculate total savings progress
  const totalSavings = summary?.balance || 0
  const savingsWithProgress = savingsGoals.map((goal) => {
    const currentAmount = Number(goal.current_amount) || 0
    const targetAmount = Number(goal.target_amount) || 0
    const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
    return {
      ...goal,
      current_amount: currentAmount,
      target_amount: targetAmount,
      percentage: Math.min(percentage, 100),
      isCompleted: currentAmount >= targetAmount,
    }
  })

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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Finance Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Track income, expenses, budgets, and savings goals</p>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} className="h-9 w-9 sm:h-10 sm:w-10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[180px] sm:min-w-[200px] justify-center px-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm sm:text-base">{formatMonth(currentMonth)}</span>
                {!isCurrentMonth && (
                  <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="text-xs sm:text-sm">
                    Today
                  </Button>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={() => changeMonth(1)} className="h-9 w-9 sm:h-10 sm:w-10">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="hidden xs:inline">Total Income</span>
                <span className="xs:hidden">Income</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">${summary?.totalIncome?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{income.length} entries</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                <span className="hidden xs:inline">Total Expenses</span>
                <span className="xs:hidden">Expenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">${summary?.totalExpenses?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{expenses.length} entries</p>
            </CardContent>
          </Card>

          <Card
            className={`border-blue-200 bg-gradient-to-br ${summary?.balance >= 0 ? "from-blue-50" : "from-amber-50"} to-white`}
          >
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="hidden xs:inline">Net Balance</span>
                <span className="xs:hidden">Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${summary?.balance >= 0 ? "text-blue-600" : "text-amber-600"}`}>
                ${summary?.balance?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {summary?.balance >= 0 ? "Surplus" : "Deficit"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                <span className="hidden xs:inline">Budget Health</span>
                <span className="xs:hidden">Budget</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
                {budgetProgress.filter((b) => !b.isOverBudget).length}/{budgets.length}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">On track</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs sm:text-sm py-2">Budgets</TabsTrigger>
            <TabsTrigger value="savings" className="text-xs sm:text-sm py-2">Savings</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">Transactions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <ExpenseCategoryChart expenses={expenses} />
              <IncomeVsExpensesChart income={income} expenses={expenses} />
            </div>

            {/* Quick Budget Overview */}
            {budgetProgress.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Budget Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {budgetProgress.slice(0, 5).map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium capitalize truncate">{budget.category}</span>
                          {budget.isOverBudget && (
                            <span className="text-xs text-red-600 flex items-center gap-1 flex-shrink-0">
                              <AlertCircle className="h-3 w-3" />
                              <span className="hidden xs:inline">Over budget</span>
                            </span>
                          )}
                          {budget.isNearLimit && (
                            <span className="text-xs text-amber-600 flex items-center gap-1 flex-shrink-0">
                              <AlertCircle className="h-3 w-3" />
                              <span className="hidden xs:inline">Near limit</span>
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">
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
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold">Monthly Budgets</h2>
              <Button onClick={() => setShowBudgetForm(true)} className="bg-purple-600 hover:bg-purple-700 w-full xs:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </div>

            {budgetProgress.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center p-4 sm:p-6">
                  <Target className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">No budgets set for this month</p>
                  <Button onClick={() => setShowBudgetForm(true)}>Create Your First Budget</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    <CardHeader className="pb-3 p-4 sm:p-6">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg capitalize truncate">{budget.category}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className={`font-semibold ${budget.isOverBudget ? "text-red-600" : ""}`}>
                          ${budget.spent.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
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
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span
                          className={`font-semibold ${budget.remaining >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ${Math.abs(budget.remaining).toFixed(2)} {budget.remaining < 0 ? "over" : "left"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Savings Goals Tab */}
          <TabsContent value="savings" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold">Savings Goals</h2>
              <Button onClick={() => setShowSavingsGoalForm(true)} className="bg-blue-600 hover:bg-blue-700 w-full xs:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>

            {savingsWithProgress.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center p-4 sm:p-6">
                  <Target className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">No savings goals yet</p>
                  <Button onClick={() => setShowSavingsGoalForm(true)}>Set Your First Goal</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {savingsWithProgress.map((goal) => (
                  <Card key={goal.id} className={goal.isCompleted ? "border-green-300 bg-green-50/50" : ""}>
                    <CardHeader className="pb-3 p-4 sm:p-6">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg truncate">{goal.goal_name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSavingsGoal(goal.id)}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                      {goal.isCompleted && (
                        <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Goal Achieved!
                        </div>
                      )}
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-semibold">${goal.current_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-semibold">${goal.target_amount.toFixed(2)}</span>
                      </div>
                      <Progress
                        value={goal.percentage}
                        className={goal.isCompleted ? "bg-green-100 [&>div]:bg-green-600" : ""}
                      />
                      <div className="flex justify-between text-xs sm:text-sm flex-wrap gap-1">
                        <span className="text-muted-foreground">
                          {goal.target_date ? `Due: ${new Date(goal.target_date).toLocaleDateString()}` : "No deadline"}
                        </span>
                        <span className="font-semibold text-blue-600">{goal.percentage.toFixed(0)}%</span>
                      </div>
                      {goal.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground pt-2 border-t">{goal.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Income Card */}
              <Card>
                <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between pb-3 p-4 sm:p-6 gap-3">
                  <CardTitle className="text-lg sm:text-xl">Income</CardTitle>
                  <Button onClick={() => setShowIncomeForm(true)} size="sm" className="bg-green-600 hover:bg-green-700 w-full xs:w-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Income
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {income.length === 0 ? (
                    <p className="text-center text-sm sm:text-base text-muted-foreground py-6 sm:py-8">No income recorded yet</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                      {income.map((item) => (
                        <div key={item.id} className="flex items-start sm:items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm sm:text-base">{item.source}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(item.income_date).toLocaleDateString()} • {item.category}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <div className="text-base sm:text-lg font-semibold text-green-600 text-right">
                              ${Number(item.amount).toFixed(2)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteIncome(item.id)}
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expenses Card */}
              <Card>
                <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between pb-3 p-4 sm:p-6 gap-3">
                  <CardTitle className="text-lg sm:text-xl">Expenses</CardTitle>
                  <Button onClick={() => setShowExpenseForm(true)} size="sm" className="bg-red-600 hover:bg-red-700 w-full xs:w-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Expense
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {expenses.length === 0 ? (
                    <p className="text-center text-sm sm:text-base text-muted-foreground py-6 sm:py-8">No expenses recorded yet</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                      {expenses.map((item) => (
                        <div key={item.id} className="flex items-start sm:items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm sm:text-base">{item.merchant || item.category}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(item.expense_date).toLocaleDateString()} • {item.category}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <div className="text-base sm:text-lg font-semibold text-red-600 text-right">
                              ${Number(item.amount).toFixed(2)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExpense(item.id)}
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
        <SavingsGoalForm
          open={showSavingsGoalForm}
          onOpenChange={setShowSavingsGoalForm}
          onSuccess={() => {
            fetchData()
            setShowSavingsGoalForm(false)
          }}
        />
      </div>
    </div>
  )
}