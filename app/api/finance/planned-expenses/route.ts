import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const user = await getUserSession()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const month = searchParams.get("month")
        const today = new Date().toISOString().split('T')[0]

        // Auto-convert past planned expenses to actual expenses
        await convertPastPlannedExpenses(user.id, today)

        let result

        if (month) {
            // Get only FUTURE planned expenses for the month
            result = await sql`
        SELECT * FROM planned_expenses 
        WHERE user_id = ${user.id}
        AND TO_CHAR(planned_date, 'YYYY-MM') = ${month}
        AND planned_date > ${today}
        ORDER BY planned_date ASC
      `
        } else {
            // Get all FUTURE planned expenses
            result = await sql`
        SELECT * FROM planned_expenses 
        WHERE user_id = ${user.id}
        AND planned_date > ${today}
        ORDER BY planned_date ASC
      `
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching planned expenses:", error)
        return NextResponse.json({ error: "Failed to fetch planned expenses" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUserSession()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { title, category, amount, plannedDate, description } = body

        if (!title || !category || !amount || !plannedDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const today = new Date().toISOString().split('T')[0]

        // If planned date is today or past, create as actual expense
        if (plannedDate <= today) {
            const result = await sql`
        INSERT INTO expenses 
        (user_id, category, amount, expense_date, description, merchant) 
        VALUES (${user.id}, ${category}, ${amount}, ${plannedDate}, ${description || null}, ${title})
        RETURNING *
      `
            return NextResponse.json(result[0], { status: 201 })
        }

        // Otherwise create as planned expense
        const result = await sql`
      INSERT INTO planned_expenses 
      (user_id, title, category, amount, planned_date, description) 
      VALUES (${user.id}, ${title}, ${category}, ${amount}, ${plannedDate}, ${description || null})
      RETURNING *
    `

        return NextResponse.json(result[0], { status: 201 })
    } catch (error) {
        console.error("Error creating planned expense:", error)
        return NextResponse.json({ error: "Failed to create planned expense" }, { status: 500 })
    }
}

// Helper function to convert past planned expenses to actual expenses
async function convertPastPlannedExpenses(userId: number, today: string) {
    try {
        // Get all past planned expenses
        const pastPlanned = await sql`
      SELECT * FROM planned_expenses 
      WHERE user_id = ${userId}
      AND planned_date <= ${today}
    `

        // Convert each to actual expense
        for (const planned of pastPlanned) {
            // Insert as actual expense
            await sql`
        INSERT INTO expenses 
        (user_id, category, amount, expense_date, description, merchant, created_at) 
        VALUES (
          ${planned.user_id}, 
          ${planned.category}, 
          ${planned.amount}, 
          ${planned.planned_date}, 
          ${planned.description || null}, 
          ${planned.title},
          ${planned.created_at}
        )
      `

            // Delete from planned expenses
            await sql`
        DELETE FROM planned_expenses 
        WHERE id = ${planned.id}
      `
        }
    } catch (error) {
        console.error("Error converting planned expenses:", error)
    }
}