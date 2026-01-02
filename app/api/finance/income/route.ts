import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"
import { autoContributeToSavings } from "@/lib/savings-utils"

export async function GET(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")

    if (month) {
      // Get income for specific month (format: YYYY-MM)
      const [year, monthNum] = month.split("-")
      const startDate = `${year}-${monthNum}-01`
      const nextMonth = new Date(parseInt(year), parseInt(monthNum), 1)
      const endDate = nextMonth.toISOString().split("T")[0]

      const income = await sql`
        SELECT * FROM income 
        WHERE user_id = ${user.id}
        AND income_date >= ${startDate}
        AND income_date < ${endDate}
        ORDER BY income_date DESC
      `
      return NextResponse.json(income)
    } else {
      // Get all income
      const income = await sql`
        SELECT * FROM income 
        WHERE user_id = ${user.id}
        ORDER BY income_date DESC
      `
      return NextResponse.json(income)
    }
  } catch (error) {
    console.error("Error fetching income:", error)
    return NextResponse.json({ error: "Failed to fetch income" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { source, amount, incomeDate, category, description, isRecurring, isHourly, hourlyRate, hoursWorked } = body

    const finalAmount =
      isHourly && hourlyRate && hoursWorked
        ? Number.parseFloat(hourlyRate) * Number.parseFloat(hoursWorked)
        : Number.parseFloat(amount)

    // Insert income
    const result = await sql`
      INSERT INTO income (
        user_id, source, amount, income_date, category, description, 
        is_recurring, is_hourly, hourly_rate, hours_worked
      )
      VALUES (
        ${user.id}, ${source}, ${finalAmount}, ${incomeDate}, ${category}, 
        ${description || null}, ${isRecurring || false}, ${isHourly || false},
        ${hourlyRate || null}, ${hoursWorked || null}
      )
      RETURNING *
    `

    // Auto-contribute to savings goals
    // This happens asynchronously so income creation doesn't fail if savings fails
    autoContributeToSavings(user.id, finalAmount, incomeDate)
      .catch(err => console.error("Failed to auto-contribute to savings:", err))

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating income:", error)
    return NextResponse.json({ error: "Failed to create income" }, { status: 500 })
  }
}