import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await sql`
      DELETE FROM savings_goals 
      WHERE id = ${parseInt(id)} AND user_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting savings goal:", error)
    return NextResponse.json({ error: "Failed to delete savings goal" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Handle different types of updates
    const { action, amount, ...updateFields } = body

    if (action === 'contribute') {
      // Add to current_amount
      const result = await sql`
        UPDATE savings_goals 
        SET 
          current_amount = current_amount + ${amount},
          is_completed = CASE 
            WHEN current_amount + ${amount} >= target_amount THEN TRUE 
            ELSE is_completed 
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(id)} AND user_id = ${user.id}
        RETURNING *
      `
      return NextResponse.json(result[0])
    }

    if (action === 'toggle') {
      // Toggle is_active status
      const result = await sql`
        UPDATE savings_goals 
        SET 
          is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(id)} AND user_id = ${user.id}
        RETURNING *
      `
      return NextResponse.json(result[0])
    }

    // General update - handle specific fields
    const {
      goal_name,
      target_amount,
      current_amount,
      target_date,
      description,
      allocation_type,
      allocation_value,
      frequency,
      color,
      priority,
      is_active,
      is_completed
    } = updateFields

    // Build update query with all possible fields
    const result = await sql`
      UPDATE savings_goals 
      SET 
        goal_name = COALESCE(${goal_name}, goal_name),
        target_amount = COALESCE(${target_amount}, target_amount),
        current_amount = COALESCE(${current_amount}, current_amount),
        target_date = COALESCE(${target_date}, target_date),
        description = COALESCE(${description}, description),
        allocation_type = COALESCE(${allocation_type}, allocation_type),
        allocation_value = COALESCE(${allocation_value}, allocation_value),
        frequency = COALESCE(${frequency}, frequency),
        color = COALESCE(${color}, color),
        priority = COALESCE(${priority}, priority),
        is_active = COALESCE(${is_active}, is_active),
        is_completed = COALESCE(${is_completed}, is_completed),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)} AND user_id = ${user.id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating savings goal:", error)
    return NextResponse.json({ error: "Failed to update savings goal" }, { status: 500 })
  }
}