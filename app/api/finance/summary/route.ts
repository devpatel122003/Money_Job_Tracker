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

    // Get ALL savings goals (active, paused, and completed) for progress calculation
    const allSavingsGoals = await sql`
      SELECT * FROM savings_goals
      WHERE user_id = ${user.id}
    `

    // Get ACTIVE and INCOMPLETE savings goals for allocation calculation
    const activeSavingsGoals = allSavingsGoals.filter((goal: any) => goal.is_active && !goal.is_completed)

    let monthlySavingsAllocation = 0
    let overallSavingsAllocation = 0

    // Calculate total saved and target across ALL goals (active, paused, AND completed)
    // This ensures all goals count toward overall progress
    let totalCurrentlySaved = 0
    let totalTargetAmount = 0

    allSavingsGoals.forEach((goal: any) => {
      // Count ALL goals for progress (even paused and completed ones)
      totalCurrentlySaved += Number(goal.current_amount || 0)
      totalTargetAmount += Number(goal.target_amount || 0)
    })

    // Calculate allocations ONLY for ACTIVE and INCOMPLETE goals
    // This is what gets deducted from available balance
    activeSavingsGoals.forEach((goal: any) => {
      if (goal.frequency === 'monthly') {
        if (goal.allocation_type === 'fixed') {
          monthlySavingsAllocation += Number(goal.allocation_value || 0)
        } else if (goal.allocation_type === 'percentage') {
          monthlySavingsAllocation += (monthlyIncome * Number(goal.allocation_value || 0)) / 100
        }
      } else if (goal.frequency === 'overall') {
        // NEW LOGIC: Overall goals also get allocations based on income
        if (goal.allocation_type === 'percentage' && goal.allocation_value) {
          overallSavingsAllocation += (monthlyIncome * Number(goal.allocation_value || 0)) / 100
        } else if (goal.allocation_type === 'fixed' && goal.allocation_value) {
          overallSavingsAllocation += Number(goal.allocation_value || 0)
        } else {
          // Default 5% allocation for overall goals without specific allocation
          const remaining = Number(goal.target_amount) - Number(goal.current_amount)
          if (remaining > 0) {
            overallSavingsAllocation += Math.min((monthlyIncome * 5) / 100, remaining)
          }
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

    // Available balance = Total balance - ACTIVE allocations - planned expenses
    // Note: We deduct allocations (future commitments) for ACTIVE and INCOMPLETE goals only
    // But saved amounts count from ALL goals (active + paused + completed)
    const availableBalance = totalBalance - totalSavingsAllocation - totalPlannedExpenses

    // Calculate overall progress percentage (includes ALL goals, even paused and completed)
    const overallProgressPercentage = totalTargetAmount > 0
      ? Math.min((totalCurrentlySaved / totalTargetAmount) * 100, 100)
      : 0

    return NextResponse.json({
      monthlyIncome,        // Income for selected month
      monthlyExpenses,      // Expenses for selected month
      monthlyBalance: monthlyIncome - monthlyExpenses,  // Monthly balance
      totalBalance,         // Total income - total expenses (before any deductions)
      totalSavingsAllocation,  // Total allocated to ACTIVE and INCOMPLETE savings goals only
      monthlySavingsAllocation,  // Monthly recurring savings (active and incomplete only)
      overallSavingsAllocation,  // Overall goal savings allocation (active and incomplete only)
      totalCurrentlySaved,  // Total saved across ALL goals (active + paused + completed)
      totalTargetAmount,    // Total target across ALL goals (active + paused + completed)
      overallProgressPercentage, // Overall progress across ALL goals (active + paused + completed)
      availableBalance,     // Free money after ACTIVE allocations and planned expenses
      totalPlannedExpenses, // Total future planned expenses
      categoryExpenses,
      activeSavingsGoals: activeSavingsGoals.length,
      totalSavingsGoals: allSavingsGoals.length,
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}