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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-balance mb-2">Finance Dashboard</h1>
              <p className="text-muted-foreground text-balance">Track income, expenses, budgets, and savings goals</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[200px] justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{formatMonth(currentMonth)}</span>
                {!isCurrentMonth && (
                  <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                    Today
                  </Button>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${summary?.totalIncome?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">{income.length} entries</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">${summary?.totalExpenses?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">{expenses.length} entries</p>
            </CardContent>
          </Card>

          <Card
            className={`border-blue-200 bg-gradient-to-br ${summary?.balance >= 0 ? "from-blue-50" : "from-amber-50"} to-white`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${summary?.balance >= 0 ? "text-blue-600" : "text-amber-600"}`}>
                ${summary?.balance?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary?.balance >= 0 ? "Surplus" : "Deficit"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Budget Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {budgetProgress.filter((b) => !b.isOverBudget).length}/{budgets.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">On track</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="savings">Savings Goals</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseCategoryChart expenses={expenses} />
              <IncomeVsExpensesChart income={income} expenses={expenses} />
            </div>

            {/* Quick Budget Overview */}
            {budgetProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
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
                              Over budget
                            </span>
                          )}
                          {budget.isNearLimit && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Near limit
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
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Monthly Budgets</h2>
              <Button onClick={() => setShowBudgetForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </div>

            {budgetProgress.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No budgets set for this month</p>
                  <Button onClick={() => setShowBudgetForm(true)}>Create Your First Budget</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <TabsContent value="savings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Savings Goals</h2>
              <Button onClick={() => setShowSavingsGoalForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>

            {savingsWithProgress.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No savings goals yet</p>
                  <Button onClick={() => setShowSavingsGoalForm(true)}>Set Your First Goal</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savingsWithProgress.map((goal) => (
                  <Card key={goal.id} className={goal.isCompleted ? "border-green-300 bg-green-50/50" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSavingsGoal(goal.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {goal.isCompleted && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Goal Achieved!
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-semibold">${goal.current_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-semibold">${goal.target_amount.toFixed(2)}</span>
                      </div>
                      <Progress
                        value={goal.percentage}
                        className={goal.isCompleted ? "bg-green-100 [&>div]:bg-green-600" : ""}
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {goal.target_date ? `Due: ${new Date(goal.target_date).toLocaleDateString()}` : "No deadline"}
                        </span>
                        <span className="font-semibold text-blue-600">{goal.percentage.toFixed(0)}%</span>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground pt-2 border-t">{goal.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle>Income</CardTitle>
                  <Button onClick={() => setShowIncomeForm(true)} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Income
                  </Button>
                </CardHeader>
                <CardContent>
                  {income.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No income recorded yet</p>
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
                            <div className="text-lg font-semibold text-green-600">${Number(item.amount).toFixed(2)}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteIncome(item.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle>Expenses</CardTitle>
                  <Button onClick={() => setShowExpenseForm(true)} size="sm" className="bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Expense
                  </Button>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No expenses recorded yet</p>
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
                            <div className="text-lg font-semibold text-red-600">${Number(item.amount).toFixed(2)}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExpense(item.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
