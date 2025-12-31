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

    // Get income for the period
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM income
      WHERE user_id = ${user.id}
      AND income_date >= ${startDate}
      AND income_date < ${endDate}
    `

    // Get expenses for the period
    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE user_id = ${user.id}
      AND expense_date >= ${startDate}
      AND expense_date < ${endDate}
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

    const totalIncome = Number(incomeResult[0]?.total || 0)
    const totalExpenses = Number(expensesResult[0]?.total || 0)

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryExpenses,
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}
