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

    // Get ALL savings goals (active, paused, and completed) for calculations
    const allSavingsGoals = await sql`
      SELECT * FROM savings_goals
      WHERE user_id = ${user.id}
    `

    // Get ACTIVE and INCOMPLETE savings goals for allocation display
    const activeSavingsGoals = allSavingsGoals.filter((goal: any) => goal.is_active && !goal.is_completed)

    let monthlySavingsAllocation = 0
    let overallSavingsAllocation = 0

    // Calculate total saved across ALL goals (active, paused, AND completed)
    // This is money that's been set aside and is no longer "available"
    let totalCurrentlySaved = 0
    let totalTargetAmount = 0

    allSavingsGoals.forEach((goal: any) => {
      // Count ALL goals' current amounts - this money is locked in savings
      totalCurrentlySaved += Number(goal.current_amount || 0)
      totalTargetAmount += Number(goal.target_amount || 0)
    })

    // Calculate EXPECTED allocations for ACTIVE and INCOMPLETE goals
    // This is for display purposes (showing what will be allocated)
    activeSavingsGoals.forEach((goal: any) => {
      if (goal.frequency === 'monthly') {
        if (goal.allocation_type === 'fixed') {
          monthlySavingsAllocation += Number(goal.allocation_value || 0)
        } else if (goal.allocation_type === 'percentage') {
          monthlySavingsAllocation += (monthlyIncome * Number(goal.allocation_value || 0)) / 100
        }
      } else if (goal.frequency === 'overall') {
        // For overall goals with allocations
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

    // FIXED: Available balance calculation
    // Available balance = Total balance - Money already locked in savings - Planned future expenses
    // 
    // Logic:
    // - totalBalance: All income minus all expenses (the gross balance)
    // - totalCurrentlySaved: Money already allocated to savings goals (no longer available)
    // - totalPlannedExpenses: Future commitments
    // 
    // The key fix: We subtract totalCurrentlySaved (actual saved amounts) 
    // instead of totalSavingsAllocation (future allocation projections)
    const availableBalance = totalBalance - totalCurrentlySaved - totalPlannedExpenses

    // Calculate overall progress percentage (includes ALL goals, even paused and completed)
    const overallProgressPercentage = totalTargetAmount > 0
      ? Math.min((totalCurrentlySaved / totalTargetAmount) * 100, 100)
      : 0

    console.log('[SUMMARY] Balance calculations:')
    console.log(`  - Total Income: $${totalAllIncome}`)
    console.log(`  - Total Expenses: $${totalAllExpenses}`)
    console.log(`  - Total Balance: $${totalBalance}`)
    console.log(`  - Total Saved (in goals): $${totalCurrentlySaved}`)
    console.log(`  - Planned Expenses: $${totalPlannedExpenses}`)
    console.log(`  - Available Balance: $${availableBalance}`)

    return NextResponse.json({
      monthlyIncome,        // Income for selected month
      monthlyExpenses,      // Expenses for selected month
      monthlyBalance: monthlyIncome - monthlyExpenses,  // Monthly balance
      totalBalance,         // Total income - total expenses (before any deductions)
      totalSavingsAllocation,  // Expected allocation for ACTIVE goals (for display)
      monthlySavingsAllocation,  // Monthly recurring allocation (for display)
      overallSavingsAllocation,  // Overall goal allocation (for display)
      totalCurrentlySaved,  // ACTUAL money locked in savings (ALL goals)
      totalTargetAmount,    // Total target across ALL goals
      overallProgressPercentage, // Overall progress across ALL goals
      availableBalance,     // Free money = balance - saved - planned
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