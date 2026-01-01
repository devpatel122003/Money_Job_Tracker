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

        let result

        if (month) {
            result = await sql`
        SELECT * FROM planned_expenses 
        WHERE user_id = ${user.id}
        AND TO_CHAR(planned_date, 'YYYY-MM') = ${month}
        ORDER BY planned_date ASC
      `
        } else {
            result = await sql`
        SELECT * FROM planned_expenses 
        WHERE user_id = ${user.id}
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