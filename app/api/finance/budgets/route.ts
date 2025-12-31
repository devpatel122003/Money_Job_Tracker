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
      // Get budgets for specific month (format: YYYY-MM)
      const [year, monthNum] = month.split("-")
      const startOfMonth = `${year}-${monthNum}-01`
      const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split("T")[0]

      const budgets = await sql`
        SELECT * FROM budgets 
        WHERE user_id = ${user.id}
        AND start_date <= ${endOfMonth}
        AND (end_date IS NULL OR end_date >= ${startOfMonth})
        ORDER BY category
      `
      return NextResponse.json(budgets)
    } else {
      // Get all active budgets
      const budgets = await sql`
        SELECT * FROM budgets 
        WHERE user_id = ${user.id}
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
        ORDER BY category
      `
      return NextResponse.json(budgets)
    }
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { category, monthly_limit, start_date } = body

    const result = await sql`
      INSERT INTO budgets (user_id, category, monthly_limit, start_date)
      VALUES (${user.id}, ${category}, ${monthly_limit}, ${start_date})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error creating budget:", error)
    if (error.message?.includes("unique")) {
      return NextResponse.json({ error: "Budget already exists for this category and period" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}
