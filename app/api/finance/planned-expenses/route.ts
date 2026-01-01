import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const user = await getUserSession()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const month = searchParams.get("month")

        let sql = `
      SELECT * FROM planned_expenses 
      WHERE user_id = $1
    `
        const params: any[] = [user.id]

        if (month) {
            sql += ` AND TO_CHAR(planned_date, 'YYYY-MM') = $2`
            params.push(month)
        }

        sql += ` ORDER BY planned_date ASC`

        const result = await query(sql, params)
        return NextResponse.json(result.rows)
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

        const result = await query(
            `INSERT INTO planned_expenses 
       (user_id, title, category, amount, planned_date, description) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
            [user.id, title, category, amount, plannedDate, description || null]
        )

        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        console.error("Error creating planned expense:", error)
        return NextResponse.json({ error: "Failed to create planned expense" }, { status: 500 })
    }
}