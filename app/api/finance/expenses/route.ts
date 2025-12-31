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

    if (month) {
      // Get expenses for specific month (format: YYYY-MM)
      const [year, monthNum] = month.split("-")
      const startDate = `${year}-${monthNum}-01`
      const nextMonth = new Date(parseInt(year), parseInt(monthNum), 1)
      const endDate = nextMonth.toISOString().split("T")[0]

      const expenses = await sql`
        SELECT * FROM expenses 
        WHERE user_id = ${user.id}
        AND expense_date >= ${startDate}
        AND expense_date < ${endDate}
        ORDER BY expense_date DESC
      `
      return NextResponse.json(expenses)
    } else {
      // Get all expenses
      const expenses = await sql`
        SELECT * FROM expenses 
        WHERE user_id = ${user.id}
        ORDER BY expense_date DESC
      `
      return NextResponse.json(expenses)
    }
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { category, amount, expenseDate, description, merchant, isRecurring } = body

    const result = await sql`
      INSERT INTO expenses (user_id, category, amount, expense_date, description, merchant, is_recurring)
      VALUES (
        ${user.id}, ${category}, ${amount}, ${expenseDate}, 
        ${description || null}, ${merchant || null}, ${isRecurring || false}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
