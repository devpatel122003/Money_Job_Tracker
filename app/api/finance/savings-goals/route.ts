import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goals = await sql`
      SELECT * FROM savings_goals 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `
    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching savings goals:", error)
    return NextResponse.json({ error: "Failed to fetch savings goals" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { goal_name, target_amount, current_amount, target_date, description } = body

    const result = await sql`
      INSERT INTO savings_goals (user_id, goal_name, target_amount, current_amount, target_date, description)
      VALUES (${user.id}, ${goal_name}, ${target_amount}, ${current_amount || 0}, ${target_date}, ${description})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating savings goal:", error)
    return NextResponse.json({ error: "Failed to create savings goal" }, { status: 500 })
  }
}
