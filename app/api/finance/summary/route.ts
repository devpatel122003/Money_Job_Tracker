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
    const today = new Date().toISOString().split('T')[0]
    const plannedExpensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM planned_expenses
      WHERE user_id = ${user.id}
      AND planned_date > ${today}
    `

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

    const monthlyIncome = Number(incomeResult[0]?.total || 0)
    const monthlyExpenses = Number(expensesResult[0]?.total || 0)
    const totalAllIncome = Number(overallIncomeResult[0]?.total || 0)
    const totalAllExpenses = Number(overallExpensesResult[0]?.total || 0)
    const totalPlannedExpenses = Number(plannedExpensesResult[0]?.total || 0)

    // Overall balance = Total income - Total expenses - Future planned expenses
    const overallBalance = totalAllIncome - totalAllExpenses - totalPlannedExpenses

    return NextResponse.json({
      monthlyIncome,        // Income for selected month
      monthlyExpenses,      // Expenses for selected month
      monthlyBalance: monthlyIncome - monthlyExpenses,  // Monthly balance
      overallBalance,       // Total balance including planned expenses deduction
      totalPlannedExpenses, // Total future planned expenses
      categoryExpenses,
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}