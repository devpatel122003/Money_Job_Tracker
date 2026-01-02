import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")

    let startDate, endDate

    if (month) {
      // Get specific month (format: YYYY-MM)
      const [year, monthNum] = month.split("-")
      startDate = `${year}-${monthNum}-01`
      const nextMonth = new Date(parseInt(year), parseInt(monthNum), 1)
      endDate = nextMonth.toISOString().split("T")[0]
    } else {
      // Get current month
      const now = new Date()
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      endDate = nextMonth.toISOString().split("T")[0]
    }

    // Get income for the period (monthly)
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM income
      WHERE user_id = ${user.id}
      AND income_date >= ${startDate}
      AND income_date < ${endDate}
    `

    // Get expenses for the period (monthly)
    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE user_id = ${user.id}
      AND expense_date >= ${startDate}
      AND expense_date < ${endDate}
    `

    // Get overall balance (all time) - Total income minus total expenses
    const overallIncomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM income
      WHERE user_id = ${user.id}
    `

    const overallExpensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE user_id = ${user.id}
    `

    // Get total planned expenses (future only)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const plannedExpensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM planned_expenses
      WHERE user_id = ${user.id}
      AND planned_date > ${today}
    `

    // Calculate monthly values BEFORE using them
    const monthlyIncome = Number(incomeResult[0]?.total || 0)
    const monthlyExpenses = Number(expensesResult[0]?.total || 0)
    const totalAllIncome = Number(overallIncomeResult[0]?.total || 0)
    const totalAllExpenses = Number(overallExpensesResult[0]?.total || 0)
    const totalPlannedExpenses = Number(plannedExpensesResult[0]?.total || 0)

    // Get all savings goals (not just active) to calculate total saved
    const allSavingsGoals = await sql`
      SELECT * FROM savings_goals
      WHERE user_id = ${user.id}
    `

    // Get active savings goals for allocation calculation
    const activeSavingsGoals = allSavingsGoals.filter((goal: any) => goal.is_active)

    let monthlySavingsAllocation = 0
    let overallSavingsAllocation = 0
    let totalCurrentlySaved = 0

    // Calculate how much is currently saved across all goals
    allSavingsGoals.forEach((goal: any) => {
      totalCurrentlySaved += Number(goal.current_amount || 0)
    })

    // Calculate allocations for active goals only
    activeSavingsGoals.forEach((goal: any) => {
      if (goal.frequency === 'monthly' && goal.allocation_type === 'fixed') {
        monthlySavingsAllocation += Number(goal.allocation_value || 0)
      } else if (goal.frequency === 'monthly' && goal.allocation_type === 'percentage') {
        monthlySavingsAllocation += (monthlyIncome * Number(goal.allocation_value || 0)) / 100
      } else if (goal.frequency === 'overall') {
        const remaining = Number(goal.target_amount) - Number(goal.current_amount)
        if (remaining > 0) {
          overallSavingsAllocation += remaining
        }
      }
    })

    const totalSavingsAllocation = monthlySavingsAllocation + overallSavingsAllocation

    // Get expenses by category for the period
    const categoryExpenses = await sql`
      SELECT category, COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE user_id = ${user.id}
      AND expense_date >= ${startDate}
      AND expense_date < ${endDate}
      GROUP BY category
      ORDER BY total DESC
    `

    // Calculate balances
    const totalBalance = totalAllIncome - totalAllExpenses

    // Available balance = Total balance - money already saved in goals - planned expenses
    // This represents truly free money
    const availableBalance = totalBalance - totalCurrentlySaved - totalPlannedExpenses

    // Overall balance = Total income - Total expenses - Future planned expenses (ORIGINAL LOGIC)
    const overallBalance = totalAllIncome - totalAllExpenses - totalPlannedExpenses

    return NextResponse.json({
      monthlyIncome,        // Income for selected month
      monthlyExpenses,      // Expenses for selected month
      monthlyBalance: monthlyIncome - monthlyExpenses,  // Monthly balance
      totalBalance,         // Total income - total expenses (before any deductions)
      totalSavingsAllocation,  // Total allocated to active savings goals
      monthlySavingsAllocation,  // Monthly recurring savings
      overallSavingsAllocation,  // Overall goal savings still needed
      totalCurrentlySaved,  // Total amount already saved across all goals
      availableBalance,     // Free money after savings and planned expenses
      overallBalance,       // KEPT FOR DASHBOARD: Income - Expenses - Planned (no savings deducted)
      totalPlannedExpenses, // Total future planned expenses
      categoryExpenses,
      activeSavingsGoals: activeSavingsGoals.length,
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}